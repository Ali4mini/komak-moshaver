from dataclasses import dataclass
from faster_whisper import WhisperModel
from typing import List, Tuple, Optional
import logging
from pathlib import Path

@dataclass
class TranscriptionConfig:
    """Configuration for Persian ASR"""
    model_size: str = "large-v3"
    language: str = "fa"
    device: str = "cuda"
    compute_type: str = "float16"
    beam_size: int = 15
    vad_filter: bool = True
    initial_prompt: str = "مکالمه بین مشاور املاک و مشتری درباره خرید ملک"

class PersianASRModel:
    def __init__(self, config: Optional[TranscriptionConfig] = None):
        self.config = config or TranscriptionConfig()
        self.model = None
        self.logger = logging.getLogger(__name__)

    def load_model(self):
        """Lazy-load the Whisper model"""
        if self.model is None:
            self.logger.info("Loading Whisper model...")
            try:
                self.model = WhisperModel(
                    self.config.model_size,
                    device=self.config.device,
                    compute_type=self.config.compute_type
                )
                self.logger.info("Model loaded successfully")
            except Exception as e:
                self.logger.error(f"Model loading failed: {str(e)}")
                raise RuntimeError("ASR model initialization failed")

    def transcribe(self, audio_path: str) -> Tuple[List[dict], dict]:
        """
        Transcribe audio file
        Returns:
            Tuple of (segments, metadata)
        """
        if not Path(audio_path).exists():
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        self.load_model()

        try:
            segments, info = self.model.transcribe(
                audio_path,
                language=self.config.language,
                beam_size=self.config.beam_size,
                vad_filter=self.config.vad_filter,
                initial_prompt=self.config.initial_prompt
            )
            
            return (
                [{"start": s.start, "end": s.end, "text": s.text} for s in segments],
                {
                    "language": info.language,
                    "duration": info.duration,
                    "model": self.config.model_size
                }
            )
        except Exception as e:
            self.logger.error(f"Transcription failed: {str(e)}")
            raise
