from fastapi import FastAPI, HTTPException, status
from fastapi.responses import JSONResponse
from ASR import PersianASRModel
from typing import Optional
from pathlib import Path
import os

app = FastAPI(
    title="Persian ASR API",
    version="1.0",
    description="GPU-accelerated Persian speech recognition"
)

# Initialize model (singleton pattern)
asr_model = PersianASRModel()

@app.post("/transcribe")
async def transcribe_audio(data: dict):
    """Handle audio file path and transcription"""
    # 1. Validate request contains file_path
    if not data or "file_path" not in data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file path provided in request"
        )

    file_path = data["file_path"]

    # 2. Validate path security (prevent directory traversal)
    # try:
    #     file_path = str(Path(file_path).resolve())
    #     if not file_path.startswith(settings.MEDIA_ROOT):
    #         raise HTTPException(
    #             status_code=status.HTTP_403_FORBIDDEN,
    #             detail="Access to specified path is forbidden"
    #         )
    # except Exception as e:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail=f"Invalid file path: {str(e)}"
    #     )

    # 3. Validate file exists
    if not os.path.isfile(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found at specified path"
        )

    # 4. Validate file extension
    valid_extensions = {'.wav', '.mp3', '.ogg', '.flac', '.m4a'}
    file_ext = os.path.splitext(file_path)[1].lower()
    if file_ext not in valid_extensions:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type. Supported formats: {', '.join(valid_extensions)}"
        )

    # 5. Process the file
    try:
        # Check file size (optional)
        file_size = os.path.getsize(file_path) / (1024 * 1024)  # in MB
        if file_size > 50:  # 50MB limit example
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File too large (max 50MB)"
            )

        # Perform transcription
        transcription = asr_model.transcribe(file_path)
        
        return {
            "status": "success",
            "file_path": file_path,
            "file_size_mb": round(file_size, 2),
            "transcription": transcription,
            "language": "persian"  # optional metadata
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transcription failed: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """Service health check"""
    try:
        asr_model.load_model()  # Will raise error if GPU unavailable
        return {"status": "healthy", "device": asr_model.config.device}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service unavailable: {str(e)}"
        )
