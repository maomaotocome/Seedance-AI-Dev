// SQLite/libsql may reject a second writer before its transaction starts.
// Retry only the explicit lock error, never network errors with unknown outcome.
// Work passed here must contain database operations only, not provider requests.
export async function ledgerTransaction<T>(
  database: any,
  work: (tx: any) => Promise<T>
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await database.transaction(work);
    } catch (error) {
      let current: any = error;
      let locked = false;
      for (
        let depth = 0;
        current && depth < 4;
        depth++, current = current.cause
      ) {
        if (
          current.code === 'SQLITE_BUSY' ||
          current.code === 'SQLITE_BUSY_SNAPSHOT'
        )
          locked = true;
      }
      if (!locked || attempt >= 4) throw error;
      await new Promise((resolve) => setTimeout(resolve, 25 * 2 ** attempt));
    }
  }
}
