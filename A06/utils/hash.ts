import * as FileSystem from "expo-file-system";

export async function md5OfLocalFile(uri: string): Promise<string | null> {
  try {
    const info = await FileSystem.getInfoAsync(uri, { md5: true });
    return info.exists ? (info.md5 ?? null) : null;
  } catch {
    return null;
  }
}

export async function md5OfRemoteFile(url: string): Promise<string | null> {
  try {
    const baseDir = (FileSystem as unknown as { cacheDirectory?: string }).cacheDirectory;
    if (!baseDir) return null;
    const target = `${baseDir}avatar-current-${Date.now()}.img`;
    const dl = await FileSystem.downloadAsync(url, target, { md5: true });
    const hash = dl.md5 ?? null;
    await FileSystem.deleteAsync(dl.uri, { idempotent: true }).catch(() => undefined);
    return hash;
  } catch {
    return null;
  }
}

