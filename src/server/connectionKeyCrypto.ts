function encryptionKey(): Uint8Array {
  const encoded = process.env["APP_USER_CONNECTION_KEY_SECRET"];
  if (!encoded) throw new Error("Connection encryption is not configured.");
  const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
  if (bytes.byteLength !== 32) throw new Error("Connection encryption is not configured correctly.");
  return bytes;
}

function encodeBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export async function encryptConnectionKey(plaintext: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encryptionKey(), "AES-GCM", false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plaintext)),
  );
  const packed = new Uint8Array(iv.length + ciphertext.length);
  packed.set(iv);
  packed.set(ciphertext, iv.length);
  return encodeBase64(packed);
}

export async function decryptConnectionKey(stored: string): Promise<string> {
  const packed = Uint8Array.from(atob(stored), (character) => character.charCodeAt(0));
  if (packed.byteLength <= 12) throw new Error("Stored connection is invalid.");
  const key = await crypto.subtle.importKey("raw", encryptionKey(), "AES-GCM", false, ["decrypt"]);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: packed.slice(0, 12) },
    key,
    packed.slice(12),
  );
  return new TextDecoder().decode(plaintext);
}