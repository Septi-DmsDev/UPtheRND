from __future__ import annotations

import time
from pathlib import Path

from app.config import settings
from app.job_store import append_log, claim_next_job, read_job, release_lock, write_job
from app.pipeline import run_upscale


def iso_now() -> str:
    return time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())


def mark_processing(job_path: Path, job: dict) -> dict:
    started_at = iso_now()
    job['status'] = 'processing'
    job['startedAt'] = started_at
    job['updatedAt'] = started_at
    append_log(job, 'Worker picked the job and started processing.')
    write_job(job_path, job)
    return job


def mark_failed(job_path: Path, job: dict, message: str) -> None:
    finished_at = iso_now()
    job['status'] = 'failed'
    job['finishedAt'] = finished_at
    job['updatedAt'] = finished_at
    job['error'] = message
    append_log(job, message, level='error')
    write_job(job_path, job)


def mark_done(job_path: Path, job: dict, result: dict) -> None:
    finished_at = iso_now()
    output_path = Path(result['outputPath'])
    job['status'] = 'done'
    job['finishedAt'] = finished_at
    job['updatedAt'] = finished_at
    job['output'] = {
        'storedName': output_path.name,
        'mimeType': 'image/png',
        'size': output_path.stat().st_size,
        'engine': result['engine'],
        'durationMs': result['durationMs'],
        'warnings': result.get('warnings', []),
    }
    append_log(job, f"Processing complete using {result['engine']}.")
    for warning in result.get('warnings', []):
        append_log(job, warning, level='warn')
    write_job(job_path, job)


def process_once() -> bool:
    claimed = claim_next_job(settings.jobs_dir)
    if claimed is None:
        return False

    job_path, lock_path = claimed
    try:
        job = read_job(job_path)
        if job is None:
            return False

        job = mark_processing(job_path, job)
        result = run_upscale(job=job, settings=settings)
        mark_done(job_path, job, result)
        return True
    except Exception as exc:  # noqa: BLE001
        job = read_job(job_path)
        if job is not None:
            mark_failed(job_path, job, str(exc))
        return False
    finally:
        release_lock(lock_path)


def main() -> None:
    settings.ensure_directories()
    print('[worker] started with provider=', settings.upscale_provider, flush=True)
    while True:
        processed = process_once()
        if not processed:
            time.sleep(settings.poll_interval_seconds)


if __name__ == '__main__':
    main()
