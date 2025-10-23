# OMRChecker Web UI - Quick Start Guide

## 🎉 What's New?

Your OMRChecker now has a modern web interface! You can now:
- Upload OMR sheets through a web browser
- Process multiple sheets at once
- View and download results
- No command line needed for basic operations

## 📦 What Was Created

### Backend API (`api/` folder)
- `server.py` - FastAPI server that wraps your OMRChecker
- `requirements.txt` - API dependencies (FastAPI, uvicorn)

### Frontend (`frontend/` folder)
- Complete Next.js application with TypeScript
- Modern, responsive UI with drag-and-drop file upload
- Real-time processing status
- Results viewer with download functionality

### Helper Scripts
- `setup-webapp.bat` - One-click setup for all dependencies
- `start-backend.bat` - Start the API server
- `start-frontend.bat` - Start the web interface

### Documentation
- `WEB_APP_README.md` - Complete documentation
- `frontend/README.md` - Frontend-specific docs

## 🚀 How to Get Started

### Option 1: Automated Setup (Recommended)

1. **Run the setup script:**
   ```powershell
   .\setup-webapp.bat
   ```
   This will install all Python and Node.js dependencies.

2. **Start the backend** (in one terminal):
   ```powershell
   .\start-backend.bat
   ```
   Wait until you see "Application startup complete"

3. **Start the frontend** (in a NEW terminal):
   ```powershell
   .\start-frontend.bat
   ```
   Wait for "Ready - started server on 0.0.0.0:3000"

4. **Open your browser:**
   Go to http://localhost:3000

### Option 2: Manual Setup

1. **Install Python dependencies:**
   ```powershell
   pip install -r requirements.txt
   pip install -r api\requirements.txt
   ```

2. **Install frontend dependencies:**
   ```powershell
   cd frontend
   npm install
   cd ..
   ```

3. **Start backend:**
   ```powershell
   python api\server.py
   ```

4. **Start frontend (new terminal):**
   ```powershell
   cd frontend
   npm run dev
   ```

## 💡 Using the Web Interface

### 🌟 Smart Detection Mode (NEW! - AI-Powered)

The easiest way to get started:

1. **Upload a Sample OMR Sheet:**
   - Click "Start Smart Detection" on the home page
   - Upload ONE clear OMR sheet image
   - AI automatically detects bubbles, questions, and layout

2. **Review Detection Results:**
   - See detected layout with marked bubbles
   - View number of questions and options detected
   - Edit template if needed or export for later use

3. **Enter Answer Key:**
   - Simply select correct answers for each question
   - Save template and answer key for batch processing
   - Return to main page with everything ready!

4. **Batch Process:**
   - Upload all your OMR sheets
   - Saved template and answers are automatically used
   - Process and download results

### 🔧 Manual Mode

1. **Create Your Configuration (UI Builders):**
   - **Template Builder**: Click "Template Builder" to visually create your OMR sheet layout
     - Define field blocks for questions
     - Set bubble positions and dimensions
     - Save & Use directly or Export as JSON
   - **Config Builder**: Click "Config Builder" to configure processing settings
     - Set image dimensions
     - Configure alignment parameters
     - Adjust thresholding settings
   - **Answer Key Builder**: Click "Answer Key" to create your evaluation criteria
     - Add correct answers for each question
     - Set marking scheme (correct/incorrect/unmarked)
     - Quick generate for multiple questions

2. **Upload OMR Sheets:**
   - Drag and drop images OR click to browse
   - Supports PNG, JPG, JPEG formats
   - Can upload multiple sheets at once

3. **Use Builder Files or Upload Custom:**
   - Files created in builders are automatically used
   - Or upload your own template/config/evaluation JSON files
   - Green checkmark shows when using builder files

4. **Process:**
   - Click "Process OMR Sheets"
   - Wait for processing to complete
   - View results on the same page

5. **Download Results:**
   - Download CSV with all responses
   - Download individual processed images
   - All files are available for download

## 📊 What Happens Behind the Scenes

1. Frontend sends files to the API
2. API saves files to a temporary directory
3. OMRChecker processes the sheets (same as CLI)
4. Results are stored with a unique job ID
5. Frontend displays results with download links

## 🔧 Troubleshooting

### "Cannot connect to API"
- Make sure the backend is running (step 2)
- Check that it's running on port 8000
- Look for errors in the backend terminal

### "Module not found" errors
- Run the setup script again
- Check Python version (3.8+)
- Check Node.js version (18+)

### Port already in use
- Backend (8000): Change port in `api/server.py`
- Frontend (3000): Next.js will suggest an alternative port

### Processing fails
- Check that your template.json is valid
- Verify images are readable
- Look at backend terminal for error details

## 📁 File Structure Summary

```
OMRChecker/
├── api/
│   ├── server.py              # FastAPI backend
│   └── requirements.txt       # API dependencies
├── frontend/
│   ├── src/
│   │   ├── app/              # Pages
│   │   ├── components/       # UI components
│   │   └── lib/              # API client
│   ├── package.json
│   └── ...config files
├── setup-webapp.bat          # Setup script
├── start-backend.bat         # Start API
├── start-frontend.bat        # Start UI
└── WEB_APP_README.md         # Full docs
```

## 🎯 Next Steps

1. **Try it out** with the sample data in `samples/`
2. **Customize** the UI colors in `frontend/tailwind.config.js`
3. **Deploy** to production (see WEB_APP_README.md)
4. **Integrate** with your existing workflows

## 📚 Additional Help

- Full documentation: `WEB_APP_README.md`
- Original OMRChecker docs: [GitHub Wiki](https://github.com/Udayraj123/OMRChecker/wiki)
- Report issues: Create an issue on GitHub

## ✨ Features

✅ **🌟 Smart OMR Detection (AI-Powered)** - Upload one sheet, AI detects everything automatically!
✅ **Auto Template Generation** - No manual configuration needed
✅ **Quick Answer Entry** - Just select correct answers, we handle the rest
✅ **Save for Batch Processing** - Create template once, use for all sheets
✅ **Visual Template Builder** - Create OMR layouts without writing JSON
✅ **Config Builder** - Configure processing settings with a UI
✅ **Answer Key Builder** - Create evaluation criteria visually
✅ Drag & drop file upload
✅ Multiple file processing
✅ Real-time status updates
✅ Download results (CSV + images)
✅ Responsive design (works on mobile)
✅ Modern, clean interface
✅ Error handling and validation
✅ Save & reuse configurations

Enjoy your new OMRChecker web interface with AI-powered Smart Detection! 🚀✨
