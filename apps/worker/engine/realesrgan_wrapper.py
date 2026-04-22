from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path
from tempfile import TemporaryDirectory


SUPPORTED_OUTPUTS = {'.png', '.jpg', '.jpeg', '.webp'}


def resolve_generated_file(output_dir: Path) -> Path:
    candidates = [path for path in output_dir.rglob('*') if path.is_file() and path.suffix.lower() in SUPPORTED_OUTPUTS]
    if not candidates:
        raise FileNotFoundError('Real-ESRGAN did not create an output file.')
    candidates.sort(key=lambda item: item.stat().st_mtime, reverse=True)
    return candidates[0]


def main() -> None:
    parser = argparse.ArgumentParser(description='Thin wrapper around the official Real-ESRGAN inference script.')
    parser.add_argument('--input', required=True)
    parser.add_argument('--output', required=True)
    parser.add_argument('--scale', type=int, default=2)
    parser.add_argument('--repo-dir', required=True)
    parser.add_argument('--model-name', default='RealESRGAN_x2plus')
    parser.add_argument('--fp32', action='store_true')
    args = parser.parse_args()

    repo_dir = Path(args.repo_dir)
    inference_script = repo_dir / 'inference_realesrgan.py'

    if not inference_script.exists():
        raise FileNotFoundError(f'Official Real-ESRGAN repo not found at {inference_script}')

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with TemporaryDirectory() as temp_dir:
        command = [
            sys.executable,
            str(inference_script),
            '-n',
            args.model_name,
            '-i',
            args.input,
            '-o',
            temp_dir,
            '-s',
            str(args.scale),
        ]
        if args.fp32:
            command.append('--fp32')

        completed = subprocess.run(command, cwd=repo_dir, check=True, capture_output=True, text=True)
        generated_file = resolve_generated_file(Path(temp_dir))
        shutil.move(str(generated_file), output_path)

        if completed.stderr:
            print(completed.stderr, file=sys.stderr)


if __name__ == '__main__':
    main()
