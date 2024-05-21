const WebSocket = require('ws');

const wss = new WebSocket.Server({port: 8080});

wss.on('connection', function connection(ws) {
    console.log('Novo cliente conectado.');

    ws.on('message', function incoming(message){
        console.log('Mensagem recebida %s', message);
    });

    ws.send('Conexão estabelecida com sucesso.');
})