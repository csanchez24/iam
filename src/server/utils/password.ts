import bcrypt from 'bcrypt';

export async function hashPassord(passStr: string) {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(passStr, salt);
  } catch (e) {
    console.log(`[Error]@hashPassword: `, e);
    throw e;
  }
}

export async function verifyPassord(passStr: string, passHash: string) {
  try {
    return await bcrypt.compare(passStr, passHash);
  } catch (e) {
    console.log(`[Error]@verifyPassword: `, e);
    throw e;
  }
}
