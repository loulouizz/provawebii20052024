const socket = new WebSocket('ws://localhost:8080');

socket.onopen = function() {
    console.log('Conexão estabelecida.');
    socket.send('Olá, servidor!');
};

socket.onmessage = function(event){
    console.log('Mensagem ao servidor:', event.data);
};

socket.onclose = function() {
    console.log('Conexão encerrada');
};

