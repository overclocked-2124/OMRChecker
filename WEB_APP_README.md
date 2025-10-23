# OMRChecker Web Application

A modern web interface for OMRChecker built with Next.js and FastAPI.

## 🏗️ Architecture

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: FastAPI (Python)
- **Core**: OMRChecker Python library

## 📋 Prerequisites

- Python 3.8 or higher
- Node.js 18 or higher
- npm or yarn

## 🚀 Quick Start

### 1. Install Python Dependencies

First, install the core OMRChecker dependencies:

```powershell
# From the root directory
pip install -r requirements.txt
```

Then install the API dependencies:

```powershell
pip install -r api/requirements.txt
```

### 2. Install Frontend Dependencies

```powershell
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Return to root
cd ..
```

### 3. Start the Backend API

Open a terminal and run:

```powershell
# From the root directory
python api/server.py
```

The API will start at `http://localhost:8000`

You can verify it's running by visiting `http://localhost:8000` in your browser.

### 4. Start the Frontend

Open a **new terminal** and run:

```powershell
# Navigate to the frontend directory
cd frontend

# Start the development server
npm run dev
```

The web application will start at `http://localhost:3000`

## 📖 Usage

1. Open your browser and go to `http://localhost:3000`
2. Upload your OMR sheet images (PNG, JPG, JPEG)
3. Optionally upload template, config, and evaluation JSON files
4. Click "Process OMR Sheets"
5. View and download the results

## 📁 Project Structure

```
OMRChecker/
├── api/
│   ├── server.py           # FastAPI backend server
│   ├── requirements.txt    # API dependencies
│   └── uploads/            # Temporary upload directory (auto-created)
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx  # Root layout
│   │   │   ├── page.tsx    # Main page
│   │   │   └── globals.css # Global styles
│   │   ├── components/
│   │   │   ├── UploadSection.tsx    # File upload UI
│   │   │   └── ResultsSection.tsx   # Results display
│   │   └── lib/
│   │       └── api.ts      # API client functions
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── next.config.js
├── src/                    # Core OMRChecker library
├── samples/                # Sample templates and configs
└── main.py                 # CLI entry point
```

## 🔧 API Endpoints

The FastAPI backend provides the following endpoints:

- `GET /` - Health check
- `POST /api/process` - Process OMR sheets
- `GET /api/download/{job_id}/{file_path}` - Download processed files
- `GET /api/samples` - List available sample templates
- `DELETE /api/cleanup/{job_id}` - Clean up temporary files

## 🎨 Features

- **Drag & Drop Upload**: Easy file uploading with visual feedback
- **Multiple File Support**: Upload multiple OMR sheets at once
- **Optional Configuration**: Add custom templates, configs, and evaluation files
- **Real-time Processing**: See processing status in real-time
- **Download Results**: Download CSV results and processed images
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, professional interface with Tailwind CSS

## 🛠️ Development

### Frontend Development

```powershell
cd frontend
npm run dev     # Start dev server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
```

### Backend Development

The FastAPI server includes auto-reload during development:

```powershell
python api/server.py
```

For production deployment with uvicorn:

```powershell
uvicorn api.server:app --host 0.0.0.0 --port 8000
```

## 🔒 Security Notes

- The API accepts file uploads - ensure proper validation in production
- CORS is configured for `http://localhost:3000` - update for production
- Temporary files are stored in `api/uploads/` - configure cleanup policies
- File paths are validated to prevent directory traversal attacks

## 🐛 Troubleshooting

### Backend Issues

**API won't start:**
- Check if port 8000 is already in use
- Verify all Python dependencies are installed
- Check for errors in the terminal

**Processing fails:**
- Ensure template files are valid JSON
- Check that image files are readable
- Verify the OMRChecker core library is working

### Frontend Issues

**Can't connect to API:**
- Ensure the backend is running on port 8000
- Check the `.env.local` file has the correct API URL
- Verify CORS settings in the backend

**Build errors:**
- Delete `node_modules` and `.next` folders
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`

## 📝 Environment Variables

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🚢 Production Deployment

### Backend

1. Use a production ASGI server like uvicorn with workers
2. Set up proper CORS origins
3. Configure file upload limits
4. Implement file cleanup policies
5. Use environment variables for configuration

### Frontend

1. Build the Next.js app: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred host
3. Update API URL environment variable
4. Configure proper API CORS origins

## 📚 Additional Resources

- [OMRChecker Documentation](https://github.com/Udayraj123/OMRChecker/wiki)
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

Contributions are welcome! Please check the main [CONTRIBUTING.md](../CONTRIBUTING.md) file.

## 📄 License

This project is part of OMRChecker and follows the same license. See [LICENSE](../LICENSE) for details.
