import { ExternalBlob } from '../backend';

export async function downloadVideo(
  blob: ExternalBlob,
  filename: string,
  onProgress?: (pct: number) => void
): Promise<void> {
  onProgress?.(0);

  const bytes = await blob
    .withUploadProgress((pct) => onProgress?.(pct))
    .getBytes();

  onProgress?.(100);

  // Detect MIME type from filename extension
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'mp4';
  const mimeMap: Record<string, string> = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    mkv: 'video/x-matroska',
    ogv: 'video/ogg',
  };
  const mimeType = mimeMap[ext] ?? 'video/mp4';

  const blobObj = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blobObj);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
