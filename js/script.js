'use strict';

// Lógica de inicialización
document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('start-game');
    const playerNameInput = document.getElementById('player-name');
    const timeLimitSelect = document.getElementById('time-limit');

    startButton.addEventListener('click', function() {
        const playerName = playerNameInput.value.trim();
        const timeLimit = parseInt(timeLimitSelect.value, 10);

        if (playerName.length >= 3) {
            startGame(playerName, timeLimit);
        } else {
            showModal('El nombre del jugador debe tener al menos 3 letras.');
        }
    });
});

// Lógica del juego
function startGame(playerName, timeLimit) {
    console.log('Iniciando juego para:', playerName, 'con tiempo:', timeLimit, 'minutos');
    document.getElementById('game-setup').style.display = 'none';
    document.getElementById('game-board').style.display = 'block';
    const display = document.getElementById('timer');
    startTimer(timeLimit * 60, display);
}

// Temporizador
function startTimer(duration, display) {
    let timer = duration, minutes, seconds;
    const interval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        display.textContent = minutes + ':' + seconds;

        if (--timer < 0) {
            clearInterval(interval);
            endGame();
        }
    }, 1000);
}

function endGame() {
    console.log('El tiempo se ha acabado');
    showModal('El tiempo se ha acabado. ¡Juego terminado!');
}

// Modal
function showModal(message) {
    console.log(message);
    // Aquí implementaremos la lógica para mostrar un modal con el mensaje
}
