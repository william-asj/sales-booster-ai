import oracledb from 'oracledb';

// Configuration for Oracle Database
const dbConfig: oracledb.ConnectionAttributes = {
  user: process.env.ORACLE_USER || 'placeholder_user',
  password: process.env.ORACLE_PASSWORD || 'placeholder_password',
  connectString: process.env.ORACLE_CONNECTION_STRING || 'localhost:1521/xe',
};

// TODO: Configure Oracle Instant Client if using Thin driver is not enough 
// or if you are on an older version of node-oracledb.
// oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient_19_8' });

let pool: oracledb.Pool | null = null;

/**
 * Initializes the Oracle connection pool if it doesn't exist.
 */
async function initializePool() {
  if (!pool) {
    try {
      pool = await oracledb.createPool({
        ...dbConfig,
        poolMin: 1,
        poolMax: 10,
        poolIncrement: 1,
      });
      console.log('Oracle Connection Pool initialized');
    } catch (err) {
      console.error('Error initializing Oracle Pool:', err);
      throw err;
    }
  }
  return pool;
}

/**
 * Generic query function to execute SQL statements.
 * @param sql The SQL query string.
 * @param binds The bind variables for the query.
 * @param options Query options.
 */
export async function executeQuery<T>(
  sql: string,
  binds: oracledb.BindParameters = [],
  options: oracledb.ExecuteOptions = { outFormat: oracledb.OUT_FORMAT_OBJECT, autoCommit: true }
): Promise<T[]> {
  const connectionPool = await initializePool();
  let connection: oracledb.Connection | null = null;

  try {
    connection = await connectionPool.getConnection();
    const result = await connection.execute(sql, binds, options);
    return (result.rows as T[]) || [];
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}
