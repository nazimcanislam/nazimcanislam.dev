/** Metni panoya kopyalar; Clipboard API yoksa veya başarısız olursa false döner. */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
