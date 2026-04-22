const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function validateUpload(file: File, maxUploadBytes: number) {
  if (!allowedMimeTypes.has(file.type)) {
    return 'Format file belum didukung. Gunakan JPG, PNG, atau WebP.';
  }

  if (file.size > maxUploadBytes) {
    return `Ukuran file melebihi batas ${Math.round(maxUploadBytes / 1024 / 1024)} MB.`;
  }

  return null;
}

export function getExtensionFromFile(file: File) {
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.png')) return '.png';
  if (fileName.endsWith('.webp')) return '.webp';
  return '.jpg';
}
