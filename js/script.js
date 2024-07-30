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
    const endGameButton = document.getElementById('end-game-button');
    const endGameSection = document.getElementById('end-game-section');

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
        showModal('', true);  // True indica que se debe mostrar el ranking
    });

    clearWordButton.addEventListener('click', () => {
        currentWord = '';
        selectedCells = [];
        lastSelectedCell = null;
        updateDisplay();
    });

    endGameButton.addEventListener('click', function() {
        // Ocultar la sección de finalización del juego
        endGameSection.style.display = 'none';
        
        // Ocultar el tablero de juego
        document.getElementById('game-board').style.display = 'none';
        
        // Mostrar el menú de configuración
        document.getElementById('game-setup').style.display = 'block';
    
        // Recargar el HTML del menú de configuración
        loadGameSetup();
    });
    
    function loadGameSetup() {
        const gameSetupSection = document.getElementById('game-setup');
        
        // Usar fetch para cargar el HTML desde un archivo
        fetch('../index.html')
            .then(response => response.text())
            .then(html => {
                // Extraer el contenido de la sección de configuración
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newGameSetupHTML = doc.getElementById('game-setup').innerHTML;
                gameSetupSection.innerHTML = newGameSetupHTML;
            })
            .catch(error => {
                console.error('Error al cargar el HTML del menú:', error);
            });
    }
    
    function startGame(playerName, timeLimit) {
        console.log('Iniciando juego para:', playerName, 'con tiempo:', timeLimit, 'minutos');
        document.getElementById('game-setup').style.display = 'none';
        document.getElementById('game-board').style.display = 'block';
        endGameSection.style.display = 'none';  // Oculta la sección de finalizar juego
        boardLetters = generateBoard();
        gameActive = true;
        startTimer(timeLimit * 60);
        score = 0;
        foundWords = [];
        updateDisplay();
    }

    function startTimer(duration) {
        clearInterval(timer);  // Detiene cualquier temporizador existente
        let timerDisplay = document.getElementById('timer');
        timeLeft = duration;  // Inicializa el tiempo restante
        updateTimerDisplay();  // Muestra el tiempo inicial

        timer = setInterval(function () {
            if (timeLeft > 0) {
                timeLeft--;  // Decrementa el tiempo restante
                updateTimerDisplay();  // Actualiza la visualización del temporizador
            } else {
                console.log('El temporizador ha llegado a cero.');  // Mensaje de depuración
                clearInterval(timer);
                endGame();  // Finaliza el juego
            }
        }, 1000);  // Ejecuta cada segundo
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
        gameActive = false;  // Desactiva el juego para que no se pueda seguir jugando
        // Crea el mensaje adicional
        const finalMessage = `El tiempo se ha acabado. ¡Juego terminado! Has hecho ${score} puntos. Muy bien! Gracias por jugar!`;
        // Muestra el modal con el mensaje final y el mensaje de puntuación
        showModal(finalMessage); 
        saveGameResult();
        document.getElementById('game-board').style.display = 'none';  // Oculta el tablero
        endGameSection.style.display = 'block';  // Muestra el botón de finalizar juego
    }

    function showModal(message, isRanking = false) {
        const modalMessage = document.getElementById('modal-message');
        if (isRanking) {
            displayRanking();
            modalMessage.innerHTML = '';  // Limpia el mensaje de la modal
        } else {
            modalMessage.textContent = message;
        }
        modal.style.display = 'block';
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
        currentWord += boardLetters[row][col];
        lastSelectedCell = { row, col };

        cell.classList.add('selected');
        updateDisplay();
    }

    function isContiguous(cell1, cell2) {
        const deltaRow = Math.abs(cell1.row - cell2.row);
        const deltaCol = Math.abs(cell1.col - cell2.col);
        return deltaRow <= 1 && deltaCol <= 1 && (deltaRow + deltaCol > 0);
    }

    function updateDisplay() {
        currentWordDisplay.textContent = currentWord;
        foundWordsDisplay.innerHTML = foundWords.join('<br>');
        scoreDisplay.textContent = `Puntuación: ${score}`;

        const cells = board.getElementsByClassName('selected');
        Array.from(cells).forEach(cell => cell.classList.remove('selected'));

        selectedCells.forEach(cell => {
            const cellElement = board.querySelector(`[data-row="${cell.row}"][data-col="${cell.col}"]`);
            cellElement.classList.add('selected');
        });
    }
});
