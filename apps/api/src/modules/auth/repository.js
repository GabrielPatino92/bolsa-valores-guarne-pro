function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    username: row.username,
    fullName: row.full_name,
    passwordHash: row.password_hash,
    isActive: row.is_active,
    emailVerified: row.email_verified,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapRefreshToken(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
    replacedByTokenId: row.replaced_by_token_id,
    userAgent: row.user_agent,
    ipAddress: row.ip_address,
    createdAt: row.created_at
  };
}

export function createPgUserRepository({ pool }) {
  return {
    async findByEmail(email) {
      const query = `
        SELECT
          id,
          email,
          username,
          full_name,
          password_hash,
          is_active,
          email_verified,
          created_at,
          updated_at
        FROM users
        WHERE email = $1
        LIMIT 1
      `;
      const result = await pool.query(query, [email]);
      return mapUser(result.rows[0]);
    },

    async findByUsername(username) {
      const query = `
        SELECT
          id,
          email,
          username,
          full_name,
          password_hash,
          is_active,
          email_verified,
          created_at,
          updated_at
        FROM users
        WHERE username = $1
        LIMIT 1
      `;
      const result = await pool.query(query, [username]);
      return mapUser(result.rows[0]);
    },

    async findById(id) {
      const query = `
        SELECT
          id,
          email,
          username,
          full_name,
          password_hash,
          is_active,
          email_verified,
          created_at,
          updated_at
        FROM users
        WHERE id = $1
        LIMIT 1
      `;
      const result = await pool.query(query, [id]);
      return mapUser(result.rows[0]);
    },

    async create({ email, username, fullName, passwordHash }) {
      const query = `
        INSERT INTO users (email, username, full_name, password_hash)
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          email,
          username,
          full_name,
          password_hash,
          is_active,
          email_verified,
          created_at,
          updated_at
      `;
      const result = await pool.query(query, [
        email,
        username,
        fullName,
        passwordHash
      ]);
      return mapUser(result.rows[0]);
    }
  };
}

export function createPgRefreshTokenRepository({ pool }) {
  return {
    async create({ userId, tokenHash, expiresAt, userAgent = null, ipAddress = null }) {
      const query = `
        INSERT INTO auth_refresh_tokens (
          user_id,
          token_hash,
          expires_at,
          user_agent,
          ip_address
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          id,
          user_id,
          token_hash,
          expires_at,
          revoked_at,
          replaced_by_token_id,
          user_agent,
          ip_address,
          created_at
      `;
      const result = await pool.query(query, [
        userId,
        tokenHash,
        expiresAt,
        userAgent,
        ipAddress
      ]);
      return mapRefreshToken(result.rows[0]);
    },

    async findByTokenHash(tokenHash) {
      const query = `
        SELECT
          id,
          user_id,
          token_hash,
          expires_at,
          revoked_at,
          replaced_by_token_id,
          user_agent,
          ip_address,
          created_at
        FROM auth_refresh_tokens
        WHERE token_hash = $1
        LIMIT 1
      `;
      const result = await pool.query(query, [tokenHash]);
      return mapRefreshToken(result.rows[0]);
    },

    async revoke({ id, replacedByTokenId = null }) {
      const query = `
        UPDATE auth_refresh_tokens
        SET
          revoked_at = NOW(),
          replaced_by_token_id = $2
        WHERE id = $1
        RETURNING
          id,
          user_id,
          token_hash,
          expires_at,
          revoked_at,
          replaced_by_token_id,
          user_agent,
          ip_address,
          created_at
      `;
      const result = await pool.query(query, [id, replacedByTokenId]);
      return mapRefreshToken(result.rows[0]);
    }
  };
}
