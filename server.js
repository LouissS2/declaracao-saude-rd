require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

/* TESTE DO SERVIDOR */
app.get('/', (req, res) => {
  res.send('Servidor da Declaração de Saúde funcionando');
});


/* RECEBE A DECLARAÇÃO E ENVIA PARA O RD */
app.post('/declaracao-saude', async (req, res) => {

  try {

    const {
      email,
      nome,
      respostas
    } = req.body;

    /* EMAIL É OBRIGATÓRIO NO RD */
    if (!email) {
      return res.status(400).json({
        erro: 'Email obrigatório'
      });
    }

    /* POR ENQUANTO MOSTRA AS RESPOSTAS NO TERMINAL */
    console.log('==============================');
    console.log('NOVA DECLARAÇÃO DE SAÚDE');
    console.log('Email:', email);
    console.log('Nome:', nome);
    console.log('Respostas:', respostas);
    console.log('==============================');


    /* ENVIO PARA O RD STATION */
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


/* PORTA DO SERVIDOR */
const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {

  console.log(
    `Servidor rodando em http://localhost:${PORT}`
  );

});