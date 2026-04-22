'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatBytes } from '@/lib/format';
import { appConfig } from '@/lib/config';

const modelOptions = [
  { value: 'standard', label: 'Standard photo' },
  { value: 'portrait', label: 'Portrait / wajah' },
  { value: 'illustration', label: 'Illustration / anime' },
] as const;

export function UploadPanel() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(String(appConfig.defaultScale));
  const [model, setModel] = useState('standard');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const preview = useMemo(() => {
    if (!file) return null;

    return {
      name: file.name,
      size: formatBytes(file.size),
      type: file.type || 'unknown',
    };
  }, [file]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setError('Pilih gambar terlebih dahulu.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const payload = new FormData();
      payload.append('file', file);
      payload.append('scale', scale);
      payload.append('model', model);

      const response = await fetch('/api/jobs', {
        method: 'POST',
        body: payload,
      });

      const data = (await response.json()) as { error?: string; job?: { id: string } };

      if (!response.ok || !data.job) {
        throw new Error(data.error || 'Gagal membuat job baru.');
      }

      router.push(`/result/${data.job.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Terjadi kesalahan saat upload.');
      setIsSubmitting(false);
    }
  }

  return (
    <form className="upload-panel" onSubmit={handleSubmit}>
      <div className="field-grid">
        <div className="field">
          <label htmlFor="image-file">Image file</label>
          <input
            id="image-file"
            className="input"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
          <p className="field-help small-text">Maksimal {appConfig.maxUploadMb} MB. Format: JPG, PNG, WebP.</p>
        </div>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="scale">Scale</label>
            <select id="scale" className="select" value={scale} onChange={(event) => setScale(event.target.value)}>
              {appConfig.allowedScales.map((allowedScale) => (
                <option key={allowedScale} value={allowedScale}>
                  {allowedScale}x
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="model">Profile</label>
            <select id="model" className="select" value={model} onChange={(event) => setModel(event.target.value)}>
              {modelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {preview ? (
        <section className="file-preview">
          <h3>File summary</h3>
          <div className="meta-grid">
            <div className="meta-item">
              <span>Nama file</span>
              <strong>{preview.name}</strong>
            </div>
            <div className="meta-item">
              <span>Ukuran</span>
              <strong>{preview.size}</strong>
            </div>
            <div className="meta-item">
              <span>Tipe</span>
              <strong>{preview.type}</strong>
            </div>
            <div className="meta-item">
              <span>Mode proses</span>
              <strong>{model}</strong>
            </div>
          </div>
        </section>
      ) : null}

      {error ? (
        <div className="status-callout alert-error">
          <strong>Upload gagal</strong>
          <p className="small-text">{error}</p>
        </div>
      ) : null}

      <button type="submit" className="button" disabled={isSubmitting}>
        {isSubmitting ? 'Membuat job...' : 'Upload dan proses'}
      </button>
    </form>
  );
}
