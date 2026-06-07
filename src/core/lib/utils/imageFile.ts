const IMAGE_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'svg',
  'webp',
  'heic',
  'heif',
  'bmp',
]);

const EXT_TO_MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
  bmp: 'image/bmp',
};

export function getImageFileExtension(fileName: string): string | null {
  const base = fileName.split(/[/\\]/).pop() ?? fileName;
  const dot = base.lastIndexOf('.');
  if (dot < 0) return null;
  const ext = base.slice(dot + 1).trim().toLowerCase();
  return ext || null;
}

/** Accept images when MIME is missing (common on Linux / some mobile exports). */
export function isAcceptableImageFile(file: File): boolean {
  if (file.type?.startsWith('image/')) return true;
  const ext = getImageFileExtension(file.name);
  return ext != null && IMAGE_EXTENSIONS.has(ext);
}

/** Resolve a server-safe image MIME for presigned URL requests. */
export function resolveImageContentType(file: File): string {
  if (file.type?.startsWith('image/')) return file.type;
  const ext = getImageFileExtension(file.name);
  if (ext && EXT_TO_MIME[ext]) return EXT_TO_MIME[ext];
  return 'image/jpeg';
}
