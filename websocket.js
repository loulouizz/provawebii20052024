const express = require('express');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '', 'index.html'));
});

const server = app.listen(port, () => {
    console.log(`Servidor HTTP rodando em http://localhost:${port}`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Novo cliente conectado.');

    ws.send('Conexão estabelecida com sucesso.');

    ws.on('message', (message) => {
        console.log('Mensagem recebida: %s', message);
        ws.send(`Servidor: ${message}`);
    });

    ws.on('close', () => {
        console.log('penis');
    });
});
