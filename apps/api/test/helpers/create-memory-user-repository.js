import { randomUUID } from 'node:crypto';

export function createMemoryUserRepository(seed = []) {
  const users = new Map();

  for (const user of seed) {
    users.set(user.id, user);
  }

  return {
    async findByEmail(email) {
      return [...users.values()].find((user) => user.email === email) ?? null;
    },
    async findByUsername(username) {
      return [...users.values()].find((user) => user.username === username) ?? null;
    },
    async findById(id) {
      return users.get(id) ?? null;
    },
    async create({ email, username, fullName, passwordHash }) {
      const now = new Date().toISOString();
      const user = {
        id: randomUUID(),
        email,
        username,
        fullName,
        passwordHash,
        isActive: true,
        emailVerified: false,
        createdAt: now,
        updatedAt: now
      };
      users.set(user.id, user);
      return user;
    }
  };
}
