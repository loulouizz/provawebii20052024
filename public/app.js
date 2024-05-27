document.addEventListener("DOMContentLoaded", () => {
    const messagesDiv = document.getElementById("messages");

    const socket = new WebSocket("ws://localhost:8080");

    var botao = document.getElementById('butao');
    botao.addEventListener('click', function(){
        alert('Bem vindo!');
    });

    const displayMessage = (message) => {
        const messageElement = document.createElement("div");
        messageElement.textContent = message;
        messagesDiv.appendChild(messageElement);
    };

    socket.addEventListener("open", () => {
        displayMessage("Conectado ao servidor WebSocket");
    });

    socket.addEventListener("message", (event) => {
        displayMessage(`Mensagem do servidor: ${event.data}`);
    });

    socket.addEventListener("close", () => {
        displayMessage("Desconectado do servidor WebSocket");
    });

    socket.addEventListener("error", (error) => {
        displayMessage(`Erro: ${error.message}`);
    });
});
