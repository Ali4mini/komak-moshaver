import time
from dataclasses import dataclass
from faster_whisper import WhisperModel
from typing import Optional, Tuple, List


@dataclass
class TranscriptionConfig:
    """Configuration for audio transcription."""
    model_size: str = "large-v3"  # Options: "tiny", "base", "small", "medium", "large-v3"
    language: Optional[str] = "fa"  # "fa" for Persian/Farsi, None for auto-detection
    device: str = "cuda"  # "cpu" or "cuda" (GPU)
    compute_type: str = "float16"  # "float16" for GPU, "int8" for CPU
    # model_dir: str = "./models/"
    beam_size: int = 5  # Better accuracy but slower TODO: mess around with this
    vad_filter: bool = True  # Remove silence (better for calls)
    word_timestamps: bool = True  # Get word-level timestamps



class AudioTranscriber:
    """Handles audio transcription using Faster Whisper."""
    
    def __init__(self, config: TranscriptionConfig):
        self.config = config
        self.model = None
    
    def load_model(self) -> None:
        """Load the Whisper model."""
        print("Loading model...")
        self.model = WhisperModel(
            self.config.model_size,
            device=self.config.device,
            compute_type=self.config.compute_type,
            # download_root=self.config.model_dir
        )
    
    def transcribe(self, audio_file: str, init_prompt: str|None="این یک مکالمه بین یک مشارو املاک و یک مشتری است.") -> Tuple[List[dict], dict]:
        """
        Transcribe the given audio file.
        
        Args:
            audio_file: Path to the audio file to transcribe
            
        Returns:
            Tuple containing (segments, transcription_info)
        """
        if not self.model:
            self.load_model()
        
        print("Transcribing...")
        start_time = time.time()
        
        segments, info = self.model.transcribe(
            audio_file,
            language=self.config.language,
            beam_size=self.config.beam_size,
            vad_filter=self.config.vad_filter,
            word_timestamps=self.config.word_timestamps
        )
        
        # Convert generator to list and segments to dictionaries for easier handling
        segments_list = [
            {
                "start": segment.start,
                "end": segment.end,
                "text": segment.text,
                "words": [{"word": word.word, "start": word.start, "end": word.end} 
                          for word in segment.words] if segment.words else None
            }
            for segment in segments
        ]
        
        transcription_info = {
            "language": info.language,
            "language_probability": info.language_probability,
            "duration": info.duration,
            "processing_time": time.time() - start_time
        }
        
        return segments_list, transcription_info
    
    @staticmethod
    def save_transcription(segments: List[dict], output_file: str) -> None:
        """
        Save transcription to a text file.
        
        Args:
            segments: List of transcription segments
            output_file: Path to the output file
        """
        with open(output_file, "w", encoding="utf-8") as f:
            for segment in segments:
                f.write(f"{segment['text']}\n")


def main():
    # Configuration
    config = TranscriptionConfig()
    
    # Path to your audio file
    audio_file = "./phone_20250418-175326_09129565629.m4a"  # Supports MP3, WAV, FLAC, etc.
    output_file = "transcription.txt"
    
    # Initialize and run transcription
    transcriber = AudioTranscriber(config)
    segments, info = transcriber.transcribe(audio_file)
    
    # Print and save results
    print(f"Detected language: {info['language']}, probability: {info['language_probability']:.2f}")
    
    for segment in segments:
        print(f"[{segment['start']:.2f}s -> {segment['end']:.2f}s] {segment['text']}")
    
    transcriber.save_transcription(segments, output_file)
    print(f"Done in {info['processing_time']:.2f} seconds")


if __name__ == "__main__":
    main()
