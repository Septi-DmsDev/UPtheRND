from __future__ import annotations

from pathlib import Path
import subprocess
import sys
import time

from PIL import Image, ImageFilter, ImageOps

from app.config import Settings


RESAMPLING = Image.Resampling.LANCZOS


def _sharpness_for_model(settings: Settings, model: str) -> int:
    if model == 'portrait':
        return settings.pillow_sharpness_portrait
    if model == 'illustration':
        return settings.pillow_sharpness_illustration
    return settings.pillow_sharpness_standard


def _pillow_upscale(input_path: Path, output_path: Path, scale: int, model: str, settings: Settings) -> dict:
    sharpness = _sharpness_for_model(settings, model)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(input_path) as source_image:
        source_image = ImageOps.exif_transpose(source_image).convert('RGB')
        resized = source_image.resize((source_image.width * scale, source_image.height * scale), RESAMPLING)
        result = resized.filter(ImageFilter.UnsharpMask(radius=2, percent=sharpness, threshold=3))
        result.save(output_path, format='PNG', optimize=True)

    return {
        'engine': 'pillow-lanczos-unsharp',
        'outputPath': str(output_path),
        'warnings': [],
    }


def _realesrgan_upscale(input_path: Path, output_path: Path, scale: int, settings: Settings) -> dict:
    wrapper_path = Path(__file__).resolve().parent.parent / 'engine' / 'realesrgan_wrapper.py'
    if not wrapper_path.exists():
        raise RuntimeError('Real-ESRGAN wrapper file is missing.')

    command = [
        sys.executable,
        str(wrapper_path),
        '--input',
        str(input_path),
        '--output',
        str(output_path),
        '--scale',
        str(scale),
        '--repo-dir',
        str(settings.realesrgan_repo_dir),
        '--model-name',
        settings.realesrgan_model_name,
    ]
    if settings.realesrgan_fp32:
        command.append('--fp32')

    completed = subprocess.run(command, check=True, capture_output=True, text=True)
    warnings = []
    stderr = completed.stderr.strip()
    if stderr:
        warnings.append(stderr)
    return {
        'engine': 'realesrgan-wrapper',
        'outputPath': str(output_path),
        'warnings': warnings,
    }


def run_upscale(job: dict, settings: Settings) -> dict:
    input_path = settings.uploads_dir / job['input']['storedName']
    if not input_path.exists():
        raise FileNotFoundError(f'Input file does not exist: {input_path}')

    output_path = settings.outputs_dir / f"{job['id']}-x{job['scale']}.png"
    started = time.perf_counter()
    warnings: list[str] = []

    if settings.upscale_provider in {'auto', 'realesrgan'}:
        try:
            result = _realesrgan_upscale(input_path, output_path, int(job['scale']), settings)
            result['durationMs'] = int((time.perf_counter() - started) * 1000)
            return result
        except Exception as exc:  # noqa: BLE001
            if settings.upscale_provider == 'realesrgan':
                raise
            warnings.append(f'Real-ESRGAN fallback activated: {exc}')

    result = _pillow_upscale(input_path, output_path, int(job['scale']), str(job['model']), settings)
    result['durationMs'] = int((time.perf_counter() - started) * 1000)
    result['warnings'] = warnings + result.get('warnings', [])
    return result
