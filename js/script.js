'use strict';

document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('start-game');
    const playerNameInput = document.getElementById('player-name');
    const timeLimitSelect = document.getElementById('time-limit');
    const modal = document.getElementById('modal');
    const span = document.getElementsByClassName('close')[0];
    const welcomeMessage = document.getElementById('welcome-message');
    const submitWordButton = document.getElementById('submit-word');
    const clearWordButton = document.getElementById('clear-word');
    const currentWordDisplay = document.getElementById('current-word');
    const foundWordsDisplay = document.getElementById('found-words');
    const scoreDisplay = document.getElementById('score');
    const board = document.getElementById('board');
    const messageDisplay = document.getElementById('feedback');
    const showRankingButton = document.getElementById('show-ranking');

    let timer;
    let timeLeft;
    let currentWord = '';
    let foundWords = [];
    let score = 0;
    let playerName = '';
    const boardSize = 4;
    let boardLetters = [];
    let selectedCells = [];
    let lastSelectedCell = null;
    let gameActive = false;

    playerNameInput.addEventListener('input', function() {
        const playerName = playerNameInput.value.trim();
        if (playerName.length >= 3) {
            welcomeMessage.textContent = `¡Bienvenido ${playerName}, elige tu temporizador y comienza a jugar!`;
        } else {
            welcomeMessage.textContent = '¡Bienvenido, elige tu temporizador y comienza a jugar!';
        }
    });

    startButton.addEventListener('click', function() {
        playerName = playerNameInput.value.trim();
        const timeLimit = parseInt(timeLimitSelect.value, 10);

        if (playerName.length >= 3) {
            startGame(playerName, timeLimit);
        } else {
            showModal('El nombre del jugador debe tener al menos 3 letras.');
        }
    });

    span.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    submitWordButton.addEventListener('click', async function() {
        if (!gameActive) return;
        if (currentWord.length < 3) {
            messageDisplay.textContent = '¡Palabra demasiado corta!';
            return;
        }

        if (foundWords.includes(currentWord)) {
            messageDisplay.textContent = '¡Palabra ya encontrada!';
            return;
        }

        try {
            const palabraEsValida = await verificarPalabra(currentWord);
            if (palabraEsValida) {
                foundWords.push(currentWord);
                score += currentWord.length;
                messageDisplay.textContent = '¡Palabra correcta!';
            } else {
                score = Math.max(0, score - currentWord.length);
                messageDisplay.textContent = '¡Palabra incorrecta!';
            }
        } catch (error) {
            messageDisplay.textContent = 'Error al verificar la palabra.';
        }

        currentWord = '';
        selectedCells = [];
        lastSelectedCell = null;
        updateDisplay();
    });

    showRankingButton.addEventListener('click', function() {
        displayRanking();
        modal.style.display = 'block';
    });

    clearWordButton.addEventListener('click', () => {
        currentWord = '';
        selectedCells = [];
        lastSelectedCell = null;
        updateDisplay();
    });

    function startGame(playerName, timeLimit) {
        console.log('Iniciando juego para:', playerName, 'con tiempo:', timeLimit, 'minutos');
        document.getElementById('game-setup').style.display = 'none';
        document.getElementById('game-board').style.display = 'block';
        boardLetters = generateBoard();
        startTimer(timeLimit * 60);
        gameActive = true;
        score = 0;
        foundWords = [];
        updateDisplay();
    }

    function startTimer(duration) {
        clearInterval(timer);
        let timerDisplay = document.getElementById('timer');
        timeLeft = duration;
        updateTimerDisplay();

        timer = setInterval(function () {
            timeLeft--;
            updateTimerDisplay();

            if (timeLeft <= 0) {
                clearInterval(timer);
                endGame();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        let timerDisplay = document.getElementById('timer');
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;

        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        timerDisplay.textContent = minutes + ':' + seconds;

        if (timeLeft <= 10) {
            timerDisplay.classList.add('warning');
        } else {
            timerDisplay.classList.remove('warning');
        }
    }

    function endGame() {
        console.log('El tiempo se ha acabado');
        showModal('El tiempo se ha acabado. ¡Juego terminado!');
        saveGameResult();
        gameActive = false;
    }

    function saveGameResult() {
        const gameResult = {
            playerName,
            score,
            date: new Date().toLocaleString()
        };

        let gameResults = JSON.parse(localStorage.getItem('gameResults')) || [];
        gameResults.push(gameResult);
        localStorage.setItem('gameResults', JSON.stringify(gameResults));
    }

    function showModal(message) {
        const modalMessage = document.getElementById('modal-message');
        modalMessage.textContent = message;
        modal.style.display = 'block';
    }

    function displayRanking() {
        const rankingContent = document.getElementById('ranking-content');
        let gameResults = JSON.parse(localStorage.getItem('gameResults')) || [];

        if (gameResults.length === 0) {
            rankingContent.innerHTML = 'No hay resultados de juego disponibles.';
            return;
        }

        gameResults.sort((a, b) => b.score - a.score);
        let rankingHTML = '<h2>Ranking</h2><ol>';

        gameResults.forEach(result => {
            rankingHTML += `<li>${result.playerName} - ${result.score} puntos (${result.date})</li>`;
        });

        rankingHTML += '</ol>';
        rankingContent.innerHTML = rankingHTML;
    }

    function generateBoard() {
        const vowels = 'AEIOU';
        const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
        const boardLetters = [];
        board.innerHTML = '';

        let lettersArray = Array(5).fill().map(() => vowels.charAt(Math.floor(Math.random() * vowels.length)))
            .concat(Array(11).fill().map(() => consonants.charAt(Math.floor(Math.random() * consonants.length))));

        lettersArray = lettersArray.sort(() => Math.random() - 0.5);

        for (let i = 0; i < boardSize; i++) {
            boardLetters[i] = [];
            for (let j = 0; j < boardSize; j++) {
                const letter = lettersArray.pop();
                boardLetters[i].push(letter);

                const cell = document.createElement('div');
                cell.textContent = letter;
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener('click', handleCellClick);
                board.appendChild(cell);
            }
        }
        return boardLetters;
    }

    async function verificarPalabra(word) {
        const response = await fetch(`https://api.datamuse.com/words?sp=${word}`);
        const data = await response.json();
        return data.length > 0;
    }

    function handleCellClick(event) {
        if (!gameActive) return;

        const cell = event.target;
        const row = parseInt(cell.dataset.row, 10);
        const col = parseInt(cell.dataset.col, 10);

        if (selectedCells.some(c => c.row === row && c.col === col)) {
            return;
        }

        if (lastSelectedCell && !isContiguous(lastSelectedCell, { row, col })) {
            return;
        }

        selectedCells.push({ row, col });
        lastSelectedCell = { row, col };
        currentWord += boardLetters[row][col];

        updateDisplay();
    }

    function isContiguous(cell1, cell2) {
        const rowDiff = Math.abs(cell1.row - cell2.row);
        const colDiff = Math.abs(cell1.col - cell2.col);
        return rowDiff <= 1 && colDiff <= 1;
    }

    function updateDisplay() {
        const cells = board.querySelectorAll('div');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row, 10);
            const col = parseInt(cell.dataset.col, 10);
            cell.classList.remove('selected', 'last-selected', 'next-selectable');

            if (selectedCells.some(c => c.row === row && c.col === col)) {
                cell.classList.add('selected');
            }

            if (lastSelectedCell && lastSelectedCell.row === row && lastSelectedCell.col === col) {
                cell.classList.add('last-selected');
            }
        });

        currentWordDisplay.textContent = currentWord;
        scoreDisplay.textContent = 'Puntuación: ' + score;
        foundWordsDisplay.textContent = 'Palabras encontradas: ' + foundWords.join(', ');
    }
});
