import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export const passwordHasher = {
  hash(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
  },
  verify(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
  }
};
