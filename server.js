require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());


/* =========================================================
   TESTE DO SERVIDOR
   ========================================================= */

app.get('/', (req, res) => {
  res.send('Servidor da Declaração de Saúde funcionando');
});


/* =========================================================
   RECEBE A DECLARAÇÃO E ENVIA PARA O RD
   ========================================================= */

app.post('/declaracao-saude', async (req, res) => {

  try {

    const {
      email,
      nome,
      respostas
    } = req.body;

    if (!email) {
      return res.status(400).json({
        erro: 'Email obrigatório'
      });
    }


    console.log('==============================');
    console.log('NOVA DECLARAÇÃO DE SAÚDE');
    console.log('Email:', email);
    console.log('Nome:', nome);
    console.log('Respostas:', respostas);
    console.log('==============================');


    const respostaRD = await fetch(
      `https://api.rd.services/platform/conversions?api_key=${process.env.RD_API_KEY}`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({

          event_type: 'CONVERSION',

          event_family: 'CDP',

          payload: {

            conversion_identifier:
              'declaracao-de-saude-stark',

            email: email,

            name: nome || '',

            tags: [
              'declaracao-saude'
            ]

          }

        })
      }
    );


    const dados = await respostaRD.text();


    console.log(
      'Resposta do RD:',
      respostaRD.status,
      dados
    );


    res
      .status(respostaRD.status)
      .send(dados);


  } catch (erro) {

    console.error(
      'Erro ao enviar declaração:',
      erro
    );

    res.status(500).json({
      erro: erro.message
    });

  }

});


/* =========================================================
   LISTAR CAMPOS DO RD
   ========================================================= */

app.get('/campos-rd', async (req, res) => {

  try {

    const respostaRD = await fetch(
      `https://api.rd.services/platform/contacts/fields?api_key=${process.env.RD_API_KEY}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );


    const dados = await respostaRD.text();


    console.log(
      'Resposta campos RD:',
      respostaRD.status
    );


    res
      .status(respostaRD.status)
      .type('application/json')
      .send(dados);


  } catch (erro) {

    console.error(
      'Erro ao buscar campos do RD:',
      erro
    );

    res.status(500).json({
      erro: erro.message
    });

  }

});

app.get('/oauth/callback', async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).send('Code não recebido do RD.');
    }

    const resposta = await fetch(
      'https://api.rd.services/oauth2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: process.env.RD_CLIENT_ID,
          client_secret: process.env.RD_CLIENT_SECRET,
          code: code,
          redirect_uri:
            'https://declaracao-saude-rd.onrender.com/oauth/callback',
          grant_type: 'authorization_code'
        })
      }
    );

    const dados = await resposta.json();

    console.log('TOKENS RD:', dados);

    res.send(
      'Autorização concluída. Pode voltar para o VS Code.'
    );

  } catch (erro) {
    console.error('Erro OAuth:', erro);

    res.status(500).json({
      erro: erro.message
    });
  }
});
/* =========================================================
   PORTA DO SERVIDOR
   ========================================================= */

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {

  console.log(
    `Servidor rodando em http://localhost:${PORT}`
  );

});