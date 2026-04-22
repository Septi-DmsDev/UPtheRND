from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Iterable


def read_job(job_path: Path) -> dict | None:
    try:
        return json.loads(job_path.read_text(encoding='utf-8'))
    except FileNotFoundError:
        return None


def write_job(job_path: Path, job: dict) -> None:
    temp_path = job_path.with_suffix('.json.tmp')
    temp_path.write_text(json.dumps(job, indent=2), encoding='utf-8')
    temp_path.replace(job_path)


def append_log(job: dict, message: str, level: str = 'info') -> None:
    logs = list(job.get('logs', []))
    logs.append({'at': job.get('updatedAt') or '', 'level': level, 'message': message})
    job['logs'] = logs[-30:]


def iter_job_files(jobs_dir: Path) -> Iterable[Path]:
    return sorted(jobs_dir.glob('*.json'))


def claim_next_job(jobs_dir: Path) -> tuple[Path, Path] | None:
    for job_path in iter_job_files(jobs_dir):
        job = read_job(job_path)
        if not job or job.get('status') != 'queued':
            continue

        lock_path = Path(f'{job_path}.lock')
        try:
            handle = os.open(lock_path, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            os.close(handle)
            return job_path, lock_path
        except FileExistsError:
            continue
    return None


def release_lock(lock_path: Path) -> None:
    try:
        lock_path.unlink()
    except FileNotFoundError:
        return
