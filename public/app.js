document.addEventListener("DOMContentLoaded", () => {
    const messagesDiv = document.getElementById("messages");
    const loginDiv = document.getElementById("loginDiv");
    const nicknameInput = document.getElementById("nicknameInput");
    const joinButton = document.getElementById("joinButton");
    const spinner = document.getElementById("spinner");
    const questionDiv = document.getElementById("questionDiv");
    const buttonsDiv = document.getElementById("buttonsDiv");
    const timerDiv = document.getElementById("timerDiv");
    const resultPopup = document.getElementById("resultPopup");
    const resultMessage = document.getElementById("resultMessage");
    const closePopup = document.getElementById("closePopup");
    const playAgainButton = document.getElementById("playAgainButton");
    let nickname;
    let socket;
    let timerInterval;

    const displayMessage = (message) => {
        const messageElement = document.createElement("div");
        messageElement.textContent = message;
        while (messagesDiv.firstChild) {
            messagesDiv.removeChild(messagesDiv.firstChild);
        }
        messagesDiv.appendChild(messageElement);
    };

    const clearMessages = () => {
        while (messagesDiv.firstChild) {
            messagesDiv.removeChild(messagesDiv.firstChild);
        }
    };
    
    const displayQuestion = (question) => {
        questionDiv.textContent = question;
        clearMessages();
    };

    const createAnswerButtons = (choices) => {
        buttonsDiv.innerHTML = '';
        choices.forEach(choice => {
            const button = document.createElement("button");
            button.textContent = choice;
            button.addEventListener("click", () => {
                socket.send(JSON.stringify({ type: 'answer', nickname: nickname, answer: choice }));
            });
            buttonsDiv.appendChild(button);
        });
    };

    const showPopup = (message) => {
        resultMessage.innerHTML = message;
        resultPopup.style.display = "block";
    };

    const hidePopup = () => {
        resultPopup.style.display = "none";
    };

    const startTimer = (duration) => {
        let timeRemaining = duration;
        timerDiv.textContent = `Tempo restante: ${timeRemaining} segundos`;

        timerInterval = setInterval(() => {
            timeRemaining -= 1;
            timerDiv.textContent = `Tempo restante: ${timeRemaining} segundos`;
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
            }
        }, 1000);
    };

    const stopTimer = () => {
        clearInterval(timerInterval);
        timerDiv.textContent = '';
    };

    const resetUI = () => {
        
        questionDiv.innerHTML = '';
        buttonsDiv.innerHTML = '';
        timerDiv.textContent = '';
        timerDiv.innerHTML = ''; //10/06 00:13
        loginDiv.style.display = 'block';
    };

    closePopup.onclick = function() {
        hidePopup();
    };

    playAgainButton.onclick = function() {
        hidePopup();
        socket.send(JSON.stringify({ type: 'playAgain', nickname: nickname }));
    };

    joinButton.addEventListener("click", () => {
        nickname = nicknameInput.value;
        if (nickname) {
            socket = new WebSocket("ws://localhost:3000");

            socket.addEventListener("open", () => {
                socket.send(JSON.stringify({ type: 'join', nickname: nickname }));
            });

            socket.addEventListener("message", (event) => {
                const message = JSON.parse(event.data);
                if (message.type === 'join' && message.success === false) {
                    displayMessage("Nickname já está em uso. Por favor, escolha outro.");
                } else if (message.type === 'waiting') {
                    displayMessage(message.message);
                    spinner.style.display = 'block';
                } else if (message.type === 'question') {
                    loginDiv.style.display = 'none'; 
                    questionDiv.innerHTML = ''; 
                    displayQuestion(message.question.question);
                    createAnswerButtons(message.question.choices);
                    spinner.style.display = 'none';
                } else if (message.type === 'result') {
                    stopTimer();
                    let resultHtml = `Vencedor: ${message.winner}<br>`;
                    message.scores.forEach(score => {
                        resultHtml += `${score.nickname}: ${score.score} pontos<br>`;
                    });
                    showPopup(resultHtml);
                    resetUI();
                } else if (message.type === 'timer') {
                    startTimer(message.duration);
                }
            });

            socket.addEventListener("close", () => {
                displayMessage("Desconectado do servidor WebSocket");
            });

            socket.addEventListener("error", (error) => {
                displayMessage(`Erro: ${error.message}`);
            });
        } else {
            displayMessage("Por favor, insira um nickname.");
        }
    });
});
