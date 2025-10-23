"""
FastAPI server for OMRChecker
Provides REST API endpoints for the Next.js frontend
"""

import os
import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import json
import tempfile
import cv2
import numpy as np

from src.entry import process_dir
from src.logger import logger

app = FastAPI(title="OMRChecker API", version="1.0.0")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js default port
        "http://localhost:3001",  # Next.js alternate port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create upload directory
UPLOAD_DIR = Path("api/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "OMRChecker API is running"}


@app.post("/api/process")
async def process_omr_sheets(
    images: List[UploadFile] = File(...),
    template: Optional[UploadFile] = File(None),
    config: Optional[UploadFile] = File(None),
    evaluation: Optional[UploadFile] = File(None),
):
    """
    Process OMR sheets with optional template, config, and evaluation files
    
    Args:
        images: List of OMR sheet images (PNG, JPG, JPEG)
        template: Optional template.json file
        config: Optional config.json file
        evaluation: Optional evaluation.json file
    
    Returns:
        JSON response with processing results
    """
    
    # Create a temporary directory for this processing job
    temp_dir = Path(tempfile.mkdtemp(dir=UPLOAD_DIR))
    output_dir = temp_dir / "outputs"
    
    try:
        # Save uploaded images
        for image in images:
            if not image.filename:
                continue
            
            # Validate file extension
            ext = Path(image.filename).suffix.lower()
            if ext not in ['.png', '.jpg', '.jpeg']:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid image format: {image.filename}. Only PNG, JPG, JPEG allowed."
                )
            
            image_path = temp_dir / image.filename
            with open(image_path, "wb") as f:
                content = await image.read()
                f.write(content)
        
        # Save template if provided
        if template and template.filename:
            template_path = temp_dir / "template.json"
            with open(template_path, "wb") as f:
                content = await template.read()
                f.write(content)
        
        # Save config if provided
        if config and config.filename:
            config_path = temp_dir / "config.json"
            with open(config_path, "wb") as f:
                content = await config.read()
                f.write(content)
        
        # Save evaluation if provided
        if evaluation and evaluation.filename:
            evaluation_path = temp_dir / "evaluation.json"
            with open(evaluation_path, "wb") as f:
                content = await evaluation.read()
                f.write(content)
        
        # Process the OMR sheets
        args = {
            "input_paths": [str(temp_dir)],
            "output_dir": str(output_dir),
            "setLayout": False,
            "debug": True,
        }
        
        # Run the OMR processing
        process_dir(temp_dir, temp_dir, args)
        
        # Collect results
        results = {
            "status": "success",
            "message": "OMR sheets processed successfully",
            "output_path": str(output_dir),
            "files_processed": len(images),
        }
        
        # Try to read results CSV if available
        csv_files = list(output_dir.rglob("*.csv"))
        if csv_files:
            results["csv_file"] = str(csv_files[0].relative_to(output_dir))
        
        # List output images
        output_images = []
        for ext in ['*.png', '*.jpg', '*.jpeg']:
            output_images.extend(output_dir.rglob(ext))
        
        results["output_images"] = [
            str(img.relative_to(output_dir)) for img in output_images
        ]
        
        # Store the temp_dir path for later retrieval
        results["job_id"] = temp_dir.name
        
        return JSONResponse(content=results)
    
    except Exception as e:
        logger.error(f"Error processing OMR sheets: {str(e)}")
        # Clean up on error
        if temp_dir.exists():
            shutil.rmtree(temp_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/download/{job_id}/{file_path:path}")
async def download_file(job_id: str, file_path: str):
    """
    Download a processed file
    
    Args:
        job_id: The job ID from processing
        file_path: Relative path to the file within the output directory
    
    Returns:
        The requested file
    """
    try:
        base_path = UPLOAD_DIR / job_id / "outputs"
        full_path = base_path / file_path
        
        if not full_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        # Security check: ensure the file is within the allowed directory
        if not str(full_path.resolve()).startswith(str(base_path.resolve())):
            raise HTTPException(status_code=403, detail="Access denied")
        
        return FileResponse(
            path=full_path,
            filename=full_path.name,
            media_type="application/octet-stream"
        )
    
    except Exception as e:
        logger.error(f"Error downloading file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/samples")
async def list_samples():
    """
    List available sample templates and configurations
    
    Returns:
        List of available samples
    """
    samples_dir = Path("samples")
    if not samples_dir.exists():
        return {"samples": []}
    
    samples = []
    for sample_path in samples_dir.iterdir():
        if sample_path.is_dir() and not sample_path.name.startswith('.'):
            sample_info = {
                "name": sample_path.name,
                "has_template": (sample_path / "template.json").exists(),
                "has_config": (sample_path / "config.json").exists(),
                "has_evaluation": (sample_path / "evaluation.json").exists(),
            }
            samples.append(sample_info)
    
    return {"samples": samples}


@app.delete("/api/cleanup/{job_id}")
async def cleanup_job(job_id: str):
    """
    Clean up temporary files for a job
    
    Args:
        job_id: The job ID to clean up
    
    Returns:
        Status message
    """
    try:
        job_dir = UPLOAD_DIR / job_id
        if job_dir.exists():
            shutil.rmtree(job_dir)
            return {"status": "success", "message": f"Job {job_id} cleaned up"}
        else:
            raise HTTPException(status_code=404, detail="Job not found")
    
    except Exception as e:
        logger.error(f"Error cleaning up job: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/auto-detect")
async def auto_detect_template(image: UploadFile = File(...)):
    """
    Auto-detect OMR template from a sample image
    Analyzes the image to find bubbles and generate template
    
    Args:
        image: Sample OMR sheet image
    
    Returns:
        Detected template structure with bubble positions
    """
    temp_dir = Path(tempfile.mkdtemp(dir=UPLOAD_DIR))
    
    try:
        # Save uploaded image
        image_path = temp_dir / image.filename
        with open(image_path, "wb") as f:
            content = await image.read()
            f.write(content)
        
        # Read image
        img = cv2.imread(str(image_path))
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        height, width = gray.shape
        
        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2
        )
        
        # Find contours (potential bubbles)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter contours to find circular bubbles
        bubbles = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if 100 < area < 2000:  # Filter by area
                # Get bounding rectangle
                x, y, w, h = cv2.boundingRect(contour)
                aspect_ratio = w / float(h)
                
                # Check if roughly circular (aspect ratio close to 1)
                if 0.7 < aspect_ratio < 1.3:
                    # Calculate circularity
                    perimeter = cv2.arcLength(contour, True)
                    if perimeter > 0:
                        circularity = 4 * np.pi * area / (perimeter * perimeter)
                        if circularity > 0.6:  # Reasonably circular
                            bubbles.append({
                                'x': int(x),
                                'y': int(y),
                                'width': int(w),
                                'height': int(h),
                                'center_x': int(x + w/2),
                                'center_y': int(y + h/2)
                            })
        
        # Sort bubbles by position (top to bottom, left to right)
        bubbles.sort(key=lambda b: (b['y'], b['x']))
        
        # Group bubbles into rows (questions)
        rows = []
        current_row = []
        y_threshold = 30  # pixels tolerance for same row
        
        for bubble in bubbles:
            if not current_row:
                current_row.append(bubble)
            else:
                # Check if bubble is in same row as current_row
                avg_y = sum(b['center_y'] for b in current_row) / len(current_row)
                if abs(bubble['center_y'] - avg_y) < y_threshold:
                    current_row.append(bubble)
                else:
                    # Sort current row by x position
                    current_row.sort(key=lambda b: b['x'])
                    rows.append(current_row)
                    current_row = [bubble]
        
        # Add last row
        if current_row:
            current_row.sort(key=lambda b: b['x'])
            rows.append(current_row)
        
        # Filter rows to have consistent number of bubbles (most common count)
        from collections import Counter
        row_lengths = Counter([len(row) for row in rows])
        most_common_length = row_lengths.most_common(1)[0][0] if row_lengths else 0
        
        # Keep only rows with the most common length
        valid_rows = [row for row in rows if len(row) == most_common_length]
        
        # Calculate average bubble dimensions
        if bubbles:
            avg_width = int(np.mean([b['width'] for b in bubbles]))
            avg_height = int(np.mean([b['height'] for b in bubbles]))
        else:
            avg_width = avg_height = 32
        
        # Calculate spacing
        if valid_rows and len(valid_rows[0]) > 1:
            # Horizontal spacing between bubbles
            h_spacing = int(np.mean([
                valid_rows[0][i+1]['x'] - valid_rows[0][i]['x']
                for i in range(len(valid_rows[0])-1)
            ]))
        else:
            h_spacing = 40
        
        if len(valid_rows) > 1:
            # Vertical spacing between rows
            v_spacing = int(np.mean([
                valid_rows[i+1][0]['y'] - valid_rows[i][0]['y']
                for i in range(len(valid_rows)-1)
            ]))
        else:
            v_spacing = 60
        
        # Generate template
        num_questions = len(valid_rows)
        num_options = most_common_length if most_common_length > 0 else 4
        
        # Get the top-left position of first bubble
        if valid_rows and valid_rows[0]:
            origin_x = valid_rows[0][0]['x']
            origin_y = valid_rows[0][0]['y']
        else:
            origin_x = origin_y = 100
        
        # Create field labels (Q1, Q2, etc.)
        fields = []
        for i in range(num_questions):
            fields.append({
                "fieldLabel": f"Q{i+1}",
                "fieldType": f"QTYPE_MCQ_{num_options}",
                "bubbleValues": [chr(65+j) for j in range(num_options)],  # A, B, C, D...
                "origin": [0, i * v_spacing],
                "bubblesGap": h_spacing,
                "labelsGap": v_spacing
            })
        
        template = {
            "pageDimensions": [width, height],
            "bubbleDimensions": [avg_width, avg_height],
            "fieldBlocks": [{
                "name": "Questions",
                "origin": [origin_x, origin_y],
                "dimensions": [num_options * h_spacing, num_questions * v_spacing],
                "bubbleDimensions": [avg_width, avg_height],
                "fields": fields
            }],
            "detected_info": {
                "total_bubbles": len(bubbles),
                "valid_questions": num_questions,
                "options_per_question": num_options,
                "bubble_spacing_horizontal": h_spacing,
                "bubble_spacing_vertical": v_spacing
            }
        }
        
        # Save detected image with markings
        marked_img = img.copy()
        for row in valid_rows:
            for bubble in row:
                cv2.rectangle(
                    marked_img,
                    (bubble['x'], bubble['y']),
                    (bubble['x'] + bubble['width'], bubble['y'] + bubble['height']),
                    (0, 255, 0),
                    2
                )
        
        marked_path = temp_dir / "detected_layout.jpg"
        cv2.imwrite(str(marked_path), marked_img)
        
        return JSONResponse(content={
            "status": "success",
            "template": template,
            "job_id": temp_dir.name,
            "marked_image": "detected_layout.jpg"
        })
    
    except Exception as e:
        logger.error(f"Error in auto-detection: {str(e)}")
        if temp_dir.exists():
            shutil.rmtree(temp_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
