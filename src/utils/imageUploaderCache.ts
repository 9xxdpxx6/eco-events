// Для хранения уникального blob-URL для каждого File
export const fileToUrlMap = new Map<File, string>();

export function clearFileUrlCache() {
  for (const url of fileToUrlMap.values()) {
    URL.revokeObjectURL(url);
  }
  fileToUrlMap.clear();
} 