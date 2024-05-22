const webSocket = new WebSocket('ws://localhost:8080'); // Altere o endereço do servidor conforme necessário

webSocket.onopen = function(event) {
    showMessage('Conectado ao servidor WebSocket');
};

webSocket.onmessage = function(event) {
    showMessage(event.data);
};

webSocket.onclose = function(event) {
    showMessage('Desconectado do servidor WebSocket');
};

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value;
    webSocket.send(message);
    messageInput.value = '';
}

function showMessage(message) {
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messagesDiv.appendChild(messageElement);
}
