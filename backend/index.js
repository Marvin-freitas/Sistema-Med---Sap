const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;


app.use(cors());
app.use(bodyParser.json());

// Conexão com o banco de dados
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234", 
  database: "tutorial"
});

db.connect((err) => {
  if (err) {
    console.error("Erro na conexão com o banco de dados:", err);
    return;
  }
  console.log("Conectado ao MySQL com sucesso.");
});

// Rota de login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const loginQuery = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(loginQuery, [email, password], (err, results) => {
        if (err) {
            console.error("Erro no login:", err);
            return res.status(500).json({ message: 'Erro no servidor' });
        }

        if (results.length > 0) {
            res.json({ success: true, message: 'Login realizado com sucesso!' });
        } else {
            res.json({ success: false, message: 'Usuário ou senha inválidos' });
        }
    });
});

// Rota de cadastro
app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;

    // Verifica se o e-mail já existe
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkQuery, [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erro no servidor' });

        if (results.length > 0) {
            return res.status(400).json({ message: 'E-mail já cadastrado!' });
        }

        // Insere novo usuário
        const insertQuery = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        db.query(insertQuery, [name, email, password], (err, result) => {
            if (err) return res.status(500).json({ message: 'Erro ao cadastrar' });

            res.json({ message: 'Cadastro realizado com sucesso!' });
        });
    });
});


app.post('/api/pacientes', (req, res) => {
    const { nome, idade, genero, telefone } = req.body;

    const insertQuery = 'INSERT INTO pacientes (nome, idade, genero, telefone) VALUES (?, ?, ?, ?)';
    db.query(insertQuery, [nome, idade, genero, telefone], (err, result) => {
        if (err) {
            console.error("Erro ao inserir paciente:", err);
            return res.status(500).json({ message: 'Erro ao salvar paciente.' });
        }

        res.json({ message: 'Paciente cadastrado com sucesso!' });
    });
});

app.get('/api/pacientes/', (req, res) => {
    const selectQuery = 'SELECT * FROM pacientes';
    db.query(selectQuery, (err, results) => {
      if (err) {
        console.error("Erro ao buscar pacientes:", err);
        return res.status(500).json({ message: 'Erro ao buscar pacientes.' });
      }
      res.json(results);
    });
  });

// Rota para buscar paciente por ID
app.get('/api/pacientes/:id', (req, res) => {
    const { id } = req.params;

    const selectQuery = 'SELECT * FROM pacientes WHERE id = ?';
    db.query(selectQuery, [id], (err, results) => {
        if (err) {
            console.error("Erro ao buscar paciente:", err);
            return res.status(500).json({ message: 'Erro ao buscar paciente.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Paciente não encontrado.' });
        }

        res.json(results[0]);
    });
});

// Buscar consultas de um paciente
app.get('/api/consultas/:pacienteId', (req, res) => {
    const pacienteId = req.params.pacienteId;

    const query = 'SELECT * FROM consultas WHERE paciente_id = ? ORDER BY data DESC';
    db.query(query, [pacienteId], (err, results) => {
        if (err) {
            console.error("Erro ao buscar consultas:", err);
            return res.status(500).json({ message: 'Erro ao buscar consultas.' });
        }
        res.json(results);
    });
});

// Inserir nova consulta
app.post('/api/consultas', (req, res) => {
    const { paciente_id, data, descricao } = req.body;

    const query = 'INSERT INTO consultas (paciente_id, data, descricao) VALUES (?, ?, ?)';
    db.query(query, [paciente_id, data, descricao], (err, result) => {
        if (err) {
            console.error("Erro ao agendar consulta:", err);
            return res.status(500).json({ message: 'Erro ao agendar consulta.' });
        }

        res.json({ message: 'Consulta agendada com sucesso!' });
    });
});

app.delete('/api/pacientes/:id', (req, res) => {
    const { id } = req.params;

    const deleteConsultas = 'DELETE FROM consultas WHERE paciente_id = ?';
    const deletePaciente = 'DELETE FROM pacientes WHERE id = ?';

    db.query(deleteConsultas, [id], (err) => {
        if (err) {
            console.error("Erro ao deletar consultas:", err);
            return res.status(500).json({ message: 'Erro ao deletar consultas.' });
        }

        db.query(deletePaciente, [id], (err2, result) => {
            if (err2) {
                console.error("Erro ao deletar paciente:", err2);
                return res.status(500).json({ message: 'Erro ao deletar paciente.' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Paciente não encontrado.' });
            }

            res.json({ message: 'Paciente e suas consultas foram deletados com sucesso!' });
        });
    });
});

app.put('/api/consultas/:id', (req, res) => {
    const { id } = req.params;
    const { data, hora, medico, descricao } = req.body;

    const query = 'UPDATE consultas SET data = ?, hora = ?, medico = ?, descricao = ? WHERE id = ?';
    db.query(query, [data, hora, medico, descricao, id], (err, result) => {
        if (err) {
            console.error("Erro ao atualizar consulta:", err);
            return res.status(500).json({ message: 'Erro ao atualizar consulta.' });
        }

        res.json({ message: 'Consulta atualizada com sucesso!' });
    });
});

app.delete('/api/consultas/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM consultas WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("Erro ao excluir consulta:", err);
            return res.status(500).json({ message: 'Erro ao excluir consulta.' });
        }

        res.json({ message: 'Consulta excluída com sucesso!' });
    });
});


app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});