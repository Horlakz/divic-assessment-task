import * as argon2 from 'argon2';

export async function hashValue(value: string) {
  return await argon2.hash(value);
}

export async function verifyHash(hash: string, value: string) {
  return await argon2.verify(hash, value);
}
