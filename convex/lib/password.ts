import bcrypt from "bcryptjs";

const ROUNDS = 12;

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, ROUNDS);
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  return bcrypt.compareSync(password, passwordHash);
}
