from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import os


@dataclass(slots=True)
class Settings:
    uploads_dir: Path
    outputs_dir: Path
    jobs_dir: Path
    poll_interval_seconds: float
    upscale_provider: str
    realesrgan_repo_dir: Path
    realesrgan_model_name: str
    realesrgan_fp32: bool
    pillow_sharpness_standard: int
    pillow_sharpness_portrait: int
    pillow_sharpness_illustration: int

    def ensure_directories(self) -> None:
        self.uploads_dir.mkdir(parents=True, exist_ok=True)
        self.outputs_dir.mkdir(parents=True, exist_ok=True)
        self.jobs_dir.mkdir(parents=True, exist_ok=True)


settings = Settings(
    uploads_dir=Path(os.getenv('UPLOADS_DIR', '/data/uploads')),
    outputs_dir=Path(os.getenv('OUTPUTS_DIR', '/data/outputs')),
    jobs_dir=Path(os.getenv('JOBS_DIR', '/data/jobs')),
    poll_interval_seconds=float(os.getenv('WORKER_POLL_INTERVAL_SECONDS', '2')),
    upscale_provider=os.getenv('UPSCALE_PROVIDER', 'auto').strip().lower(),
    realesrgan_repo_dir=Path(os.getenv('REALESRGAN_REPO_DIR', '/opt/Real-ESRGAN')),
    realesrgan_model_name=os.getenv('REALESRGAN_MODEL_NAME', 'RealESRGAN_x2plus').strip(),
    realesrgan_fp32=os.getenv('REALESRGAN_FP32', '1').strip() in {'1', 'true', 'yes'},
    pillow_sharpness_standard=int(os.getenv('PILLOW_SHARPNESS_STANDARD', '130')),
    pillow_sharpness_portrait=int(os.getenv('PILLOW_SHARPNESS_PORTRAIT', '110')),
    pillow_sharpness_illustration=int(os.getenv('PILLOW_SHARPNESS_ILLUSTRATION', '160')),
)
