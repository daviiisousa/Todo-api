const expres = require("express");
const { Pool } = require("pg");
const app = expres();
const port = 3001;
require("dotenv").config();
const cors = require("cors");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:3001",
  "https://todo-tarefa.vercel.app",
];

app.use(expres.json());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

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
    const todo = await pool.query(`
        INSERT INTO todos (titulo, descricao)
        VALUES (
            '${titulo}',
            '${descricao}'
        )    
        RETURNING *
    `);

    return res.status(201).send(todo.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).send("erro no servidor: ", error);
  }
});

app.listen(port, () => {
  console.log(`servido na porta ${port}`);
});
