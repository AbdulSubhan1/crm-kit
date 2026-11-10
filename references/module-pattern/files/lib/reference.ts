// No 0/O or 1/I/L, so a reference read out on a call can't be misheard
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const LENGTH = 7;

/** A new record reference: a short code and 7 random characters, e.g. CON-J2M3HX7. */
export function newReference(code: string) {
  const bytes = crypto.getRandomValues(new Uint8Array(LENGTH));
  return `${code}-${Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("")}`;
}
