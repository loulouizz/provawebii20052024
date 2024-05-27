const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const fs = require('fs');

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

// Carregar perguntas do arquivo JSON
const questions = JSON.parse(fs.readFileSync('questions.json', 'utf8'));
let currentQuestionIndex = 0;

const players = {};

wss.on('connection', (ws) => {
    console.log('Novo cliente conectado.');

    ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Conexão estabelecida com sucesso.',
        question: questions[currentQuestionIndex]
    }));

    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        
        if (parsedMessage.type === 'answer') {
            const { playerId, answer } = parsedMessage;
            const correctAnswer = questions[currentQuestionIndex].answer;

            if (!players[playerId]) {
                players[playerId] = { score: 0 };
            }

            if (answer === correctAnswer) {
                players[playerId].score += 1;
            }

            ws.send(JSON.stringify({
                type: 'result',
                correctAnswer: correctAnswer,
                score: players[playerId].score
            }));

            currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;

            // Enviar nova pergunta para todos os clientes
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'question',
                        question: questions[currentQuestionIndex]
                    }));
                }
            });
        }
    });

    ws.on('close', () => {
        console.log('Cliente desconectado.');
    });
});
