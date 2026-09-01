export type HashAlgo = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512'

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** SHA-1/256/512 are native (Web Crypto SubtleCrypto) -- always correct,
 * never reimplemented. MD5 isn't in SubtleCrypto (deprecated for crypto
 * use, but still the standard checksum many downloads publish), so it's
 * the one algorithm here with a real hand-rolled implementation. */
export async function hashFile(file: File, algo: HashAlgo): Promise<string> {
  const buffer = await file.arrayBuffer()
  if (algo === 'MD5') return md5(buffer)
  const digest = await crypto.subtle.digest(algo, buffer)
  return toHex(digest)
}

export async function hashText(text: string, algo: HashAlgo): Promise<string> {
  const buffer = new TextEncoder().encode(text).buffer
  if (algo === 'MD5') return md5(buffer)
  const digest = await crypto.subtle.digest(algo, buffer)
  return toHex(digest)
}

// --- Minimal MD5 (RFC 1321), used only for legacy checksum verification. ---
function md5(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const words: number[] = []
  for (let i = 0; i < bytes.length; i++) {
    words[i >> 2] = (words[i >> 2] ?? 0) | (bytes[i] << ((i % 4) * 8))
  }
  const bitLen = bytes.length * 8
  words[bitLen >> 5] = (words[bitLen >> 5] ?? 0) | (0x80 << (bitLen % 32))
  words[(((bitLen + 64) >>> 9) << 4) + 14] = bitLen

  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878

  const rotl = (x: number, n: number) => (x << n) | (x >>> (32 - n))
  const cmn = (q: number, a: number, b: number, x: number, s: number, t: number) => {
    a = ((a + q) | 0) + ((x + t) | 0)
    return (rotl(a, s) + b) | 0
  }
  const ff = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn((b & c) | (~b & d), a, b, x, s, t)
  const gg = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn((b & d) | (c & ~d), a, b, x, s, t)
  const hh = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn(b ^ c ^ d, a, b, x, s, t)
  const ii = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn(c ^ (b | ~d), a, b, x, s, t)

  for (let i = 0; i < words.length; i += 16) {
    const [oa, ob, oc, od] = [a, b, c, d]
    const x = (k: number) => words[i + k] ?? 0

    a = ff(a, b, c, d, x(0), 7, -680876936); d = ff(d, a, b, c, x(1), 12, -389564586); c = ff(c, d, a, b, x(2), 17, 606105819); b = ff(b, c, d, a, x(3), 22, -1044525330)
    a = ff(a, b, c, d, x(4), 7, -176418897); d = ff(d, a, b, c, x(5), 12, 1200080426); c = ff(c, d, a, b, x(6), 17, -1473231341); b = ff(b, c, d, a, x(7), 22, -45705983)
    a = ff(a, b, c, d, x(8), 7, 1770035416); d = ff(d, a, b, c, x(9), 12, -1958414417); c = ff(c, d, a, b, x(10), 17, -42063); b = ff(b, c, d, a, x(11), 22, -1990404162)
    a = ff(a, b, c, d, x(12), 7, 1804603682); d = ff(d, a, b, c, x(13), 12, -40341101); c = ff(c, d, a, b, x(14), 17, -1502002290); b = ff(b, c, d, a, x(15), 22, 1236535329)

    a = gg(a, b, c, d, x(1), 5, -165796510); d = gg(d, a, b, c, x(6), 9, -1069501632); c = gg(c, d, a, b, x(11), 14, 643717713); b = gg(b, c, d, a, x(0), 20, -373897302)
    a = gg(a, b, c, d, x(5), 5, -701558691); d = gg(d, a, b, c, x(10), 9, 38016083); c = gg(c, d, a, b, x(15), 14, -660478335); b = gg(b, c, d, a, x(4), 20, -405537848)
    a = gg(a, b, c, d, x(9), 5, 568446438); d = gg(d, a, b, c, x(14), 9, -1019803690); c = gg(c, d, a, b, x(3), 14, -187363961); b = gg(b, c, d, a, x(8), 20, 1163531501)
    a = gg(a, b, c, d, x(13), 5, -1444681467); d = gg(d, a, b, c, x(2), 9, -51403784); c = gg(c, d, a, b, x(7), 14, 1735328473); b = gg(b, c, d, a, x(12), 20, -1926607734)

    a = hh(a, b, c, d, x(5), 4, -378558); d = hh(d, a, b, c, x(8), 11, -2022574463); c = hh(c, d, a, b, x(11), 16, 1839030562); b = hh(b, c, d, a, x(14), 23, -35309556)
    a = hh(a, b, c, d, x(1), 4, -1530992060); d = hh(d, a, b, c, x(4), 11, 1272893353); c = hh(c, d, a, b, x(7), 16, -155497632); b = hh(b, c, d, a, x(10), 23, -1094730640)
    a = hh(a, b, c, d, x(13), 4, 681279174); d = hh(d, a, b, c, x(0), 11, -358537222); c = hh(c, d, a, b, x(3), 16, -722521979); b = hh(b, c, d, a, x(6), 23, 76029189)
    a = hh(a, b, c, d, x(9), 4, -640364487); d = hh(d, a, b, c, x(12), 11, -421815835); c = hh(c, d, a, b, x(15), 16, 530742520); b = hh(b, c, d, a, x(2), 23, -995338651)

    a = ii(a, b, c, d, x(0), 6, -198630844); d = ii(d, a, b, c, x(7), 10, 1126891415); c = ii(c, d, a, b, x(14), 15, -1416354905); b = ii(b, c, d, a, x(5), 21, -57434055)
    a = ii(a, b, c, d, x(12), 6, 1700485571); d = ii(d, a, b, c, x(3), 10, -1894986606); c = ii(c, d, a, b, x(10), 15, -1051523); b = ii(b, c, d, a, x(1), 21, -2054922799)
    a = ii(a, b, c, d, x(8), 6, 1873313359); d = ii(d, a, b, c, x(15), 10, -30611744); c = ii(c, d, a, b, x(6), 15, -1560198380); b = ii(b, c, d, a, x(13), 21, 1309151649)
    a = ii(a, b, c, d, x(4), 6, -145523070); d = ii(d, a, b, c, x(11), 10, -1120210379); c = ii(c, d, a, b, x(2), 15, 718787259); b = ii(b, c, d, a, x(9), 21, -343485551)

    a = (a + oa) | 0; b = (b + ob) | 0; c = (c + oc) | 0; d = (d + od) | 0
  }

  const le = (n: number) => {
    const buf = new Uint8Array(4)
    new DataView(buf.buffer).setInt32(0, n, true)
    return buf
  }
  const out = new Uint8Array(16)
  ;[a, b, c, d].forEach((word, i) => out.set(le(word), i * 4))
  return toHex(out.buffer)
}

/** Dev-time self-check against a known RFC 1321 test vector. */
export function _md5SelfCheck(): boolean {
  const result = md5(new TextEncoder().encode('abc').buffer)
  return result === '900150983cd24fb0d6963f7d28e17f72'
}
