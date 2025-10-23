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

from src.entry import process_dir
from src.logger import logger

app = FastAPI(title="OMRChecker API", version="1.0.0")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
