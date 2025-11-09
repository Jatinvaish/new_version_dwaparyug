import bcrypt from "bcryptjs";

// Password helpers
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}
