const expres = require("express");
const { Pool } = require("pg");
const app = expres();
const port = process.env.PORT || 3001;
require("dotenv").config();
const cors = require("cors");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

app.use(expres.json());

app.use(cors());

app.get("/todos", async (_req, res) => {
  try {
    const todo = await pool.query("SELECT * FROM todos");
    res.send(todo.rows);
  } catch (error) {
    return res.status(500).send("erro no servidor: ", error);
  }
});

app.post("/todos", async (req, res) => {
  try {
    const { titulo, descricao } = req.body;

    if ((!titulo, !descricao)) {
      return res.status(400).send("Preencha todos os dados corretamente");
    }
    if (descricao.length > 100) {
      return res.status(400).send("a descricao tem mais de 100 caracteres");
    }
    const todo = await pool.query(
      `
        INSERT INTO todos (titulo, descricao)
        VALUES (
            $1,
            $2
        )    
        RETURNING *
    `,
      [titulo, descricao]
    );

    return res.status(201).send(todo.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).send("erro no servidor: ", error);
  }
});

app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const todo = await pool.query(`SELECT * FROM todos WHERE id = $1`, [id]);

    if (todo.rows.length === 0) {
      return res.status(404).send("Tarefa não encontrada");
    }

    await pool.query(`DELETE FROM todos WHERE id = $1`, [id]);

    return res.status(200).send("Tarefa deletada");
  } catch (error) {
    console.error("Erro ao deletar tarefa:", error);
    return res.status(500).send("Erro no servidor");
  }
});

app.patch("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { descricao } = req.body;
  try {
    if (!descricao) res.status(400).send("preencha os dados corretamente");

    const todo = await pool.query(
      `
        UPDATE todos SET descricao = $1 WHERE id = $2

        RETURNING *
      `,
      [descricao, id]
    );

    return res.status(201).send(todo.rows[0]);
  } catch (error) {
    return res.status(500).send("erro no servidor: ", error);
  }
});

app.patch("todos/:id", async (req, res) => {
  const { id } = req.params;
  const { concluido } = req.body;
  try {
    await pool.query(
      `
        UPDATE todos SET concluido = $1 WHERE id = $2
      `,
      [concluido, id]
    );
    return res.status(201).send("tarefa concluida");
  } catch (error) {
    return res.status(500).send("erro no servidor: ", error);
  }
});

app.listen(port, () => {
  console.log(`servido na porta ${port}`);
});
