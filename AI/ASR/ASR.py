import time
import librosa
import noisereduce as nr
import soundfile as sf
from dataclasses import dataclass
from faster_whisper import WhisperModel
from typing import Optional, List, Tuple
import librosa.display
import numpy as np
# from hazm import Normalizer

# class PostPrecessor:
#     def __init__(self) -> None:
#         self.normalizer = Normalizer()
#
#     def postprocess(self, input_text: str) -> str:
#         text = self.normalizer.normalize(input_text)
#
#         return text




@dataclass
class AudioPreprocessor:
    """Handles preprocessing pipeline for Persian phone call recordings.
    
    Attributes:
        target_sr: Target sample rate (default: 16000 for Whisper)
        reduction_strength: Noise reduction strength (0.0 to 1.0)
        norm_db: Target volume for normalization in dB
        amplification_db: Volume amplification in dB (0 means no change)
        max_amplification_db: Safety limit to prevent distortion
    """
    target_sr: int = 16000
    reduction_strength: float = 0.0
    norm_db: float = 0.0
    amplification_db: float = 5.0
    max_amplification_db: float = 10.0

    def __post_init__(self):
        self._validate_parameters()

    def _validate_parameters(self) -> None:
        """Validate processing parameters."""
        if not 0 <= self.reduction_strength <= 1:
            raise ValueError("Reduction strength must be between 0.0 and 1.0")
        
        if self.amplification_db < 0:
            raise ValueError("Amplification must be >= 0 dB")
            
        if self.amplification_db > self.max_amplification_db:
            raise ValueError(f"Amplification exceeds maximum allowed {self.max_amplification_db} dB")

    def preprocess(self, input_path: str, output_path: str) -> None:
        """Full preprocessing pipeline from input file to output file."""
        y, sr = self._load_audio(input_path)
        y = self._apply_noise_reduction(y, sr)
        y = self._apply_normalization(y)
        y = self._apply_amplification(y)
        self._save_audio(y, sr, output_path)

    def _load_audio(self, file_path: str) -> tuple[np.ndarray, int]:
        """Load audio file with resampling to target rate."""
        return librosa.load(file_path, sr=self.target_sr)

    def _apply_noise_reduction(self, y: np.ndarray, sr: int) -> np.ndarray:
        """Apply noise reduction to audio signal."""
        return nr.reduce_noise(
            y=y,
            sr=sr,
            stationary=True,
            prop_decrease=self.reduction_strength
        )

    def _apply_normalization(self, y: np.ndarray) -> np.ndarray:
        """Normalize audio to target dB level."""
        return librosa.util.normalize(y) * 10**(self.norm_db / 20)

    def _apply_amplification(self, y: np.ndarray) -> np.ndarray:
        """Apply volume amplification with clipping protection."""
        if self.amplification_db <= 0:
            return y

        amplification_factor = 10**(self.amplification_db / 20)
        y_amp = y * amplification_factor

        if np.max(np.abs(y_amp)) > 1.0:
            return np.tanh(y_amp)  # Soft clipping
        return y_amp

    def _save_audio(self, y: np.ndarray, sr: int, output_path: str) -> None:
        """Save processed audio to file."""
        sf.write(output_path, y, sr, subtype='PCM_16')

@dataclass
class TranscriptionConfig:
    """Configuration for Persian real estate calls."""
    model_size: str = "large-v3"
    language: str = "fa"  # Force Persian mode
    device: str = "cuda" 
    compute_type: str = "float16"
    beam_size: int = 15  # higher beam for better accuracy
    vad_filter: bool = True  # Critical for call recordings
    word_timestamps: bool = False  # Disable for faster processing
    initial_prompt: str = "مکالمه بین مشاور املاک و مشتری درباره خرید ملک"  # Real estate prompt


class PersianCallTranscriber:
    def __init__(self, config: TranscriptionConfig):
        self.config = config
        self.preprocessor = AudioPreprocessor()
        self.model = None

    def load_model(self):
        """Load Whisper model with Persian optimization."""
        self.model = WhisperModel(
            self.config.model_size,
            device=self.config.device,
            compute_type=self.config.compute_type
        )

    def transcribe(self, audio_path: str) -> Tuple[List[dict], dict]:
        """Full pipeline: Preprocess → Transcribe → Postprocess"""
        # 1. Preprocessing
        processed_path = "temp_processed.wav"
        self.preprocessor.preprocess(audio_path, processed_path)
        
        # 2. Load model if needed
        if not self.model:
            self.load_model()

        # 3. Transcribe with Persian-specific settings
        segments, info = self.model.transcribe(
            processed_path,
            language=self.config.language,
            beam_size=self.config.beam_size,
            vad_filter=self.config.vad_filter,
            initial_prompt=self.config.initial_prompt  # Boosts real estate terms
        )

        # Convert to structured output
        return (
            [{"start": s.start, "end": s.end, "text": s.text} for s in segments],
            {
                "language": info.language,
                "duration": info.duration,
                "original_path": audio_path
            }
        )


def main():
    # Configuration for Persian real estate calls
    config = TranscriptionConfig()
    transcriber = PersianCallTranscriber(config)
    
    # Path to your phone recording
    audio_file = "./separated/htdemucs/phone_20250418-175841_09918859799/vocals.wav"
    
    # Run pipeline
    segments, info = transcriber.transcribe(audio_file)
    
    # Save results
    with open("transcription.txt", "w", encoding="utf-8") as f:
        f.write("\n".join([s["text"] for s in segments]))
    
    print(f"Transcribed Persian call ({info['duration']:.2f}s):")
    for seg in segments:
        print(f"[{seg['start']:.1f}-{seg['end']:.1f}s]: {seg['text']}")


if __name__ == "__main__":
    main()
