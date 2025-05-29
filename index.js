const expres = require("express");
const { Pool } = require("pg");
const app = expres();
const port = 3001;
const cors = require("cors");

const pool = new Pool({
  user: "postgres.ukxvuywbzkjlxgufpqef",
  host: "aws-0-sa-east-1.pooler.supabase.com",
  password: "2710",
  port: 5432,
  database: "postgres",
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
