import time
import librosa
import noisereduce as nr
import soundfile as sf
from dataclasses import dataclass
from faster_whisper import WhisperModel
from typing import Optional, List, Tuple


@dataclass
class AudioPreprocessor:
    """Handles preprocessing for Persian phone call recordings."""
    target_sr: int = 16000  # Whisper's native sample rate
    reduction_strength: float = 0.8  # Aggressive noise reduction for phone calls
    norm_db: float = -3.0  # Target volume for normalization

    def preprocess(self, input_path: str, output_path: str) -> None:
        """
        Applies preprocessing pipeline:
        1. Load audio (resample if needed)
        2. Noise reduction
        3. Volume normalization
        4. Save processed audio
        """
        # Load with librosa (auto-resamples to target_sr)
        y, sr = librosa.load(input_path, sr=self.target_sr)
        
        # Noise reduction (critical for phone calls)
        y_clean = nr.reduce_noise(
            y=y, 
            sr=sr,
            stationary=True,  # Phone noise is usually non-stationary
            prop_decrease=self.reduction_strength
        )
        
        # Peak normalization (helps with varying call volumes)
        y_norm = librosa.util.normalize(y_clean) * 10**(self.norm_db / 20)
        
        # Save processed audio
        sf.write(output_path, y_norm, sr, subtype='PCM_16')


@dataclass
class TranscriptionConfig:
    """Configuration for Persian real estate calls."""
    model_size: str = "large-v3"
    language: str = "fa"  # Force Persian mode
    device: str = "cuda" 
    compute_type: str = "float16"
    beam_size: int = 5  # Balanced accuracy/speed
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
    audio_file = "./phone_20250418-175636_09121204808.m4a"
    
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
