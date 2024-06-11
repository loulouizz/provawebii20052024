const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = app.listen(port, () => {
    console.log(`Servidor HTTP rodando em http://localhost:${port}`);
});

const wss = new WebSocket.Server({ server });

// Carregar perguntas do arquivo JSON
const questions = JSON.parse(fs.readFileSync(path.join(__dirname, 'questions.json'), 'utf8'));
let currentQuestionIndex = 0;
const players = {}; // Armazenar jogadores conectados
const waitingPlayers = []; // Fila de espera para próxima rodada
let gameStarted = false;
let gameEndTimeout;
const gameDuration = 30; // duração do jogo em segundos

let playerCount = 0; // Contador de jogadores
let timerStarted = false; // Flag indicando se o temporizador foi iniciado

function sendToAll(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

function startGame() {
    gameStarted = true;
    currentQuestionIndex = 0;
    timerStarted = false; // Resetar a flag do temporizador
    sendQuestion();
    if (!timerStarted) {
        timerStarted = true;
        sendToAll({ type: 'timer', duration: gameDuration });
        gameEndTimeout = setTimeout(endGame, gameDuration * 1000);
    }
}

function sendQuestion() {
    const question = questions[currentQuestionIndex];
    sendToAll({ type: 'question', question: question });
}

function endGame() {
    clearTimeout(gameEndTimeout);
    gameStarted = false;
    timerStarted = false; // Resetar a flag do temporizador
    const scores = Object.values(players).map(player => ({ nickname: player.nickname, score: player.score }));
    scores.sort((a, b) => b.score - a.score);
    const winner = scores[0].nickname;

    sendToAll({ type: 'result', winner: winner, scores: scores });

    // Resetar pontuações para nova rodada
    Object.values(players).forEach(player => player.score = 0);

    // Adicionar jogadores à fila de espera para a próxima rodada
    Object.keys(players).forEach(nickname => delete players[nickname]);

    // Iniciar nova rodada apenas se houver pelo menos dois jogadores
    if (waitingPlayers.length >= 2) {
        Object.assign(players, ...waitingPlayers.map(player => ({ [player.nickname]: player })));
        waitingPlayers.length = 0;
        startGame();
    }
}

wss.on('connection', (ws) => {
    console.log('Novo cliente conectado.');
    playerCount++;

    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        console.log('Mensagem recebida:', parsedMessage);

        if (parsedMessage.type === 'join') {
            const nickname = parsedMessage.nickname;
            if (players[nickname]) {
                ws.send(JSON.stringify({ type: 'join', success: false }));
            } else {
                players[nickname] = { nickname: nickname, ws: ws, score: 0 };
                ws.send(JSON.stringify({ type: 'join', success: true }));
                if (Object.keys(players).length >= 2 && !gameStarted) {
                    startGame();
                } else if (Object.keys(players).length === 1) {
                    ws.send(JSON.stringify({ type: 'waiting', message: 'Aguardando outro jogador...' }));
                }
            }
        } else if (parsedMessage.type === 'answer' && gameStarted) {
            const player = Object.values(players).find(player => player.ws === ws);
            if (player) {
                const correctAnswer = questions[currentQuestionIndex].answer;
                if (parsedMessage.answer === correctAnswer) {
                    player.score += 1;
                }
                currentQuestionIndex += 1;
                if (currentQuestionIndex < questions.length) {
                    sendQuestion();
                } else {
                    endGame();
                }
            }
        } else if (parsedMessage.type === 'playAgain') {
            const player = waitingPlayers.find(p => p.nickname === parsedMessage.nickname) || players[parsedMessage.nickname];
            if (player) {
                waitingPlayers.push(player);
                if (!gameStarted && waitingPlayers.length >= 2) {
                    Object.assign(players, ...waitingPlayers.map(player => ({ [player.nickname]: player })));
                    waitingPlayers.length = 0;
                    startGame();
                }
            }
        }
    });

    ws.on('close', () => {
        console.log('Cliente desconectado.');
        playerCount--;
        // Remover jogador desconectado
        const disconnectedNickname = Object.values(players).find(player => player.ws === ws)?.nickname;
        if (disconnectedNickname) {
            delete players[disconnectedNickname];
        }
    });
});
