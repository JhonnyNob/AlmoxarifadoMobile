require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const banco = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

app.get("/", (req, res) => {
  res.json({
    mensagem: "API do Almoxarifado funcionando!",
  });
});

app.post("/usuarios", async (req, res) => {
  const { nome_usuario, senha } = req.body;

  if (!nome_usuario || !senha) {
    return res.status(400).json({
      mensagem: "Informe o nome de usuário e a senha.",
    });
  }

  try {
    const hash = await bcrypt.hash(senha, 10);

    await banco.execute(
      "INSERT INTO usuarios (nome_usuario, senha) VALUES (?, ?)",
      [nome_usuario, hash],
    );

    return res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",
    });
  } catch (erro) {
    if (erro.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensagem: "Esse nome de usuário já está em uso.",
      });
    }

    console.error(erro);

    return res.status(500).json({
      mensagem: "Erro ao cadastrar usuário.",
    });
  }
});

app.post("/login", async (req, res) => {
  const { nome_usuario, senha } = req.body;

  if (!nome_usuario || !senha) {
    return res.status(400).json({
      mensagem: "Informe o nome de usuário e a senha.",
    });
  }

  try {
    const [usuarios] = await banco.execute(
      "SELECT id, nome_usuario, senha FROM usuarios WHERE nome_usuario = ?",
      [nome_usuario],
    );

    if (
      usuarios.length === 0 ||
      !(await bcrypt.compare(senha, usuarios[0].senha))
    ) {
      return res.status(401).json({
        mensagem: "Nome de usuário ou senha inválidos.",
      });
    }

    return res.json({
      mensagem: "Login realizado com sucesso!",
      usuario: {
        id: usuarios[0].id,
        nome_usuario: usuarios[0].nome_usuario,
      },
    });
  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      mensagem: "Erro ao realizar login.",
    });
  }
});

app.get("/itens", async (req, res) => {
  const { usuario_id } = req.query;

  if (!usuario_id) {
    return res.status(400).json({
      mensagem: "O ID do usuário é obrigatório.",
    });
  }

  try {
    const [itens] = await banco.execute(
      "SELECT id, nome, quantidade FROM itens WHERE usuario_id = ? ORDER BY nome",
      [usuario_id],
    );

    return res.json(itens);
  } catch (erro) {
    console.error("Erro ao buscar itens:", erro);

    return res.status(500).json({
      mensagem: "Erro ao buscar itens.",
    });
  }
});

app.post("/itens", async (req, res) => {
  const { usuario_id, nome, quantidade } = req.body;

  if (
    !usuario_id ||
    typeof nome !== "string" ||
    !nome.trim() ||
    quantidade === undefined ||
    quantidade === null ||
    quantidade === ""
  ) {
    return res.status(400).json({
      mensagem: "Informe o usuário, o nome e a quantidade do item.",
    });
  }

  const quantidadeNumero = Number(quantidade);

  if (!Number.isSafeInteger(quantidadeNumero) || quantidadeNumero < 0) {
    return res.status(400).json({
      mensagem: "A quantidade deve ser um número inteiro não negativo.",
    });
  }

  try {
    const nomeLimpo = nome.trim();

    const [resultado] = await banco.execute(
      `
            INSERT INTO itens (usuario_id, nome, quantidade)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quantidade = quantidade + ?
            `,
      [usuario_id, nomeLimpo, quantidadeNumero, quantidadeNumero],
    );

    const [itens] = await banco.execute(
      `
            SELECT id, nome, quantidade
            FROM itens
            WHERE usuario_id = ? AND nome = ?
            `,
      [usuario_id, nomeLimpo],
    );

    return res.status(201).json({
      mensagem:
        resultado.affectedRows === 1
          ? "Item cadastrado com sucesso!"
          : "Quantidade adicionada ao item existente!",
      item: itens[0],
    });
  } catch (erro) {
    console.error("Erro ao cadastrar item:", erro);

    return res.status(500).json({
      mensagem: "Erro ao cadastrar item.",
    });
  }
});

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`API rodando na porta ${PORT}`);

  try {
    const conexao = await banco.getConnection();

    console.log("Conexão com MySQL estabelecida!");

    conexao.release();
  } catch (erro) {
    console.error("Erro ao conectar ao MySQL:", erro.message);
  }
});
