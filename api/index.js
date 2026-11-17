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
  res.json({ mensagem: "API do Almoxarifado funcionando!" });
});

app.post("/usuarios", async (req, res) => {
  try {
    const { nome_usuario, senha } = req.body;

    if (!nome_usuario || !senha) {
      return res.status(400).json({
        mensagem: "Nome de usuário e senha são obrigatórios.",
      });
    }

    const [usuarioExistente] = await banco.execute(
      "SELECT id FROM usuarios WHERE nome_usuario = ?",
      [nome_usuario],
    );

    if (usuarioExistente.length > 0) {
      return res.status(409).json({
        mensagem: "Esse nome de usuário já existe.",
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const [resultado] = await banco.execute(
      "INSERT INTO usuarios (nome_usuario, senha) VALUES (?, ?)",
      [nome_usuario, senhaHash],
    );

    res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso.",
      usuario: {
        id: resultado.insertId,
        nome_usuario,
      },
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao cadastrar usuário.",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { nome_usuario, senha } = req.body;

    if (!nome_usuario || !senha) {
      return res.status(400).json({
        mensagem: "Nome de usuário e senha são obrigatórios.",
      });
    }

    const [usuarios] = await banco.execute(
      "SELECT id, nome_usuario, senha FROM usuarios WHERE nome_usuario = ?",
      [nome_usuario],
    );

    if (usuarios.length === 0) {
      return res.status(401).json({
        mensagem: "Usuário ou senha incorretos.",
      });
    }

    const usuario = usuarios[0];

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({
        mensagem: "Usuário ou senha incorretos.",
      });
    }

    res.json({
      mensagem: "Login realizado com sucesso.",
      usuario: {
        id: usuario.id,
        nome_usuario: usuario.nome_usuario,
      },
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao realizar login.",
    });
  }
});

app.get("/itens", async (req, res) => {
  try {
    const { usuario_id } = req.query;

    if (!usuario_id) {
      return res.status(400).json({
        mensagem: "usuario_id é obrigatório.",
      });
    }

    const [itens] = await banco.execute(
      `SELECT id, nome, quantidade
       FROM itens
       WHERE usuario_id = ?
       ORDER BY nome`,
      [usuario_id],
    );

    res.json(itens);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar itens.",
    });
  }
});

app.post("/itens", async (req, res) => {
  try {
    const { usuario_id, nome, quantidade } = req.body;

    if (!usuario_id || !nome || quantidade === undefined) {
      return res.status(400).json({
        mensagem: "Usuário, nome e quantidade são obrigatórios.",
      });
    }

    const quantidadeNumerica = Number(quantidade);

    if (!Number.isInteger(quantidadeNumerica) || quantidadeNumerica < 0) {
      return res.status(400).json({
        mensagem:
          "A quantidade deve ser um número inteiro maior ou igual a zero.",
      });
    }

    const nomeLimpo = nome.trim();

    if (!nomeLimpo) {
      return res.status(400).json({
        mensagem: "O nome do item é obrigatório.",
      });
    }

    await banco.execute(
      `INSERT INTO itens (usuario_id, nome, quantidade)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantidade = quantidade + ?`,
      [usuario_id, nomeLimpo, quantidadeNumerica, quantidadeNumerica],
    );

    const [itens] = await banco.execute(
      `SELECT id, nome, quantidade
       FROM itens
       WHERE usuario_id = ? AND nome = ?`,
      [usuario_id, nomeLimpo],
    );

    res.status(201).json({
      mensagem: "Item adicionado com sucesso.",
      item: itens[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao adicionar item.",
    });
  }
});

app.put("/itens/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id, nome, quantidade } = req.body;

    if (!usuario_id || !nome || quantidade === undefined) {
      return res.status(400).json({
        mensagem: "Usuário, nome e quantidade são obrigatórios.",
      });
    }

    const quantidadeNumerica = Number(quantidade);

    if (!Number.isInteger(quantidadeNumerica) || quantidadeNumerica < 0) {
      return res.status(400).json({
        mensagem:
          "A quantidade deve ser um número inteiro maior ou igual a zero.",
      });
    }

    const nomeLimpo = nome.trim();

    if (!nomeLimpo) {
      return res.status(400).json({
        mensagem: "O nome do item é obrigatório.",
      });
    }

    const [resultado] = await banco.execute(
      `UPDATE itens
       SET nome = ?, quantidade = ?
       WHERE id = ? AND usuario_id = ?`,
      [nomeLimpo, quantidadeNumerica, id, usuario_id],
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensagem: "Item não encontrado.",
      });
    }

    const [itens] = await banco.execute(
      `SELECT id, nome, quantidade
       FROM itens
       WHERE id = ? AND usuario_id = ?`,
      [id, usuario_id],
    );

    res.json({
      mensagem: "Item atualizado com sucesso.",
      item: itens[0],
    });
  } catch (erro) {
    if (erro.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensagem: "Já existe um item com esse nome.",
      });
    }

    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao editar item.",
    });
  }
});

app.post("/itens/:id/saida", async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id, quantidade } = req.body;

    if (!usuario_id || quantidade === undefined) {
      return res.status(400).json({
        mensagem: "Usuário e quantidade são obrigatórios.",
      });
    }

    const quantidadeNumerica = Number(quantidade);

    if (!Number.isInteger(quantidadeNumerica) || quantidadeNumerica <= 0) {
      return res.status(400).json({
        mensagem:
          "A quantidade de saída deve ser um número inteiro maior que zero.",
      });
    }

    const [itens] = await banco.execute(
      `SELECT id, nome, quantidade
       FROM itens
       WHERE id = ? AND usuario_id = ?`,
      [id, usuario_id],
    );

    if (itens.length === 0) {
      return res.status(404).json({
        mensagem: "Item não encontrado.",
      });
    }

    const item = itens[0];

    if (quantidadeNumerica > item.quantidade) {
      return res.status(400).json({
        mensagem: `Não é possível retirar ${quantidadeNumerica} unidade(s). O estoque possui apenas ${item.quantidade}.`,
      });
    }

    await banco.execute(
      `UPDATE itens
       SET quantidade = quantidade - ?
       WHERE id = ? AND usuario_id = ?`,
      [quantidadeNumerica, id, usuario_id],
    );

    const [itemAtualizado] = await banco.execute(
      `SELECT id, nome, quantidade
       FROM itens
       WHERE id = ? AND usuario_id = ?`,
      [id, usuario_id],
    );

    res.json({
      mensagem: "Saída registrada com sucesso.",
      item: itemAtualizado[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao registrar saída.",
    });
  }
});

app.delete("/itens/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id } = req.query;

    if (!usuario_id) {
      return res.status(400).json({
        mensagem: "usuario_id é obrigatório.",
      });
    }

    const [resultado] = await banco.execute(
      `DELETE FROM itens
       WHERE id = ? AND usuario_id = ?`,
      [id, usuario_id],
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensagem: "Item não encontrado.",
      });
    }

    res.json({
      mensagem: "Item excluído com sucesso.",
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao excluir item.",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API rodando na porta ${PORT}`);
});
