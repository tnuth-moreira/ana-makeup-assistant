
const pool = require("./src/config/database");

async function testConnection() {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database, NOW() AS connected_at"
    );

    console.log("Conexão com PostgreSQL estabelecida!");
    console.log("Banco:", result.rows[0].database);
  } catch (error) {
    console.error("Não foi possível conectar ao PostgreSQL.");
    console.error("Verifique se o servidor está ativo e se o usuário tem acesso.");
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

testConnection();
