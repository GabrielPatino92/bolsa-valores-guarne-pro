function mapProvider(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    type: row.type,
    displayName: row.display_name,
    isActive: row.is_active,
    supportsTestnet: row.supports_testnet,
    createdAt: row.created_at
  };
}

export function createPgProviderRepository({ pool }) {
  return {
    async listAll() {
      const query = `
        SELECT
          id,
          name,
          type,
          display_name,
          is_active,
          supports_testnet,
          created_at
        FROM providers
        ORDER BY display_name ASC
      `;
      const result = await pool.query(query);
      return result.rows.map(mapProvider);
    },

    async findByName(name) {
      const query = `
        SELECT
          id,
          name,
          type,
          display_name,
          is_active,
          supports_testnet,
          created_at
        FROM providers
        WHERE name = $1
        LIMIT 1
      `;
      const result = await pool.query(query, [name]);
      return mapProvider(result.rows[0]);
    }
  };
}
