export function bytesToBase64(u8arr: Uint8Array): string {
  return btoa(String.fromCodePoint(...u8arr));
}

export function bytesFromBase64(encoded: string): Uint8Array {
  return Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
}

export function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

export function stringFromBytes(u8arr: Uint8Array): string {
  return new TextDecoder().decode(u8arr);
}

export function stringToBase64(str: string): string {
  return bytesToBase64(stringToBytes(str));
}

export function stringFromBase64(b64str: string): string {
  return stringFromBytes(bytesFromBase64(b64str));
}
