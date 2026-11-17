export function randomBytes(size: number): Uint8Array {
  if (!Number.isSafeInteger(size) || size < 0) {
    throw new RangeError('Random byte count must be a non-negative safe integer');
  }

  const bytes = new Uint8Array(size);
  for (let offset = 0; offset < size; offset += 65536) {
    globalThis.crypto.getRandomValues(bytes.subarray(offset, Math.min(offset + 65536, size)));
  }
  return bytes;
}
