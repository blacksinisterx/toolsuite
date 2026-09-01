/** Unicode/binary-safe Base64 -- plain btoa/atob choke on anything outside
 * Latin1, so go through bytes explicitly instead. */
export function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

export function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64.trim())
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export const textToBase64 = (text: string) => bytesToBase64(new TextEncoder().encode(text))
export const base64ToText = (b64: string) => new TextDecoder().decode(base64ToBytes(b64))
