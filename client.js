const webSocket = new WebSocket('ws://localhost:8080');

webSocket.onopen = function(event) {
    showMessage('Conectado ao servidor WebSocket');
};

webSocket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'welcome' || data.type === 'question') {
        showQuestion(data.question);
    } else if (data.type === 'result') {
        showResult(data);
    }
};

webSocket.onclose = function(event) {
    showMessage('Desconectado do servidor WebSocket');
};

function sendAnswer(answer) {
    const playerId = 'player1';  // Pode ser uma lógica para identificar o jogador
    webSocket.send(JSON.stringify({ type: 'answer', playerId: playerId, answer: answer }));
}

function showQuestion(question) {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '';  // Limpar mensagens anteriores

    const questionElement = document.createElement('div');
    questionElement.innerText = question.question;
    messagesDiv.appendChild(questionElement);

    question.choices.forEach(choice => {
        const button = document.createElement('button');
        button.innerText = choice;
        button.onclick = () => sendAnswer(choice);
        messagesDiv.appendChild(button);
    });
}

function showResult(data) {
    const resultDiv = document.createElement('div');
    resultDiv.innerText = `Resposta correta: ${data.correctAnswer}. Sua pontuação: ${data.score}`;
    document.getElementById('messages').appendChild(resultDiv);
}

function showMessage(message) {
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messagesDiv.appendChild(messageElement);
}
