
const { randomUUID } = require("crypto");
const pool = require("../config/database");

async function createAppointment({
  nome,
  evento,
  tipoCurso,
  dataEvento,
  horarioEvento,
  quantidadePessoas,
}) {
  const id = randomUUID();

  const query = `
    INSERT INTO appointments (
      id,
      client_name,
      service_type,
      course_type,
      event_date,
      event_time,
      quantity
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, status, created_at;
  `;

  const values = [
    nome,
    evento,
    tipoCurso || null,
    dataEvento || null,
    horarioEvento || null,
    quantidadePessoas ?? null,
  ];

  const result = await pool.query(query, [id, ...values]);

  return result.rows[0];
}

module.exports = {
  createAppointment,
};
