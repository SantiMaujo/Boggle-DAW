document.addEventListener('DOMContentLoaded', () => {
    const startGameButton = document.getElementById('start-game');
    const playerNameInput = document.getElementById('player-name');
    const timeLimitSelect = document.getElementById('time-limit');
    const gameSetupSection = document.getElementById('game-setup');
    const gameBoardSection = document.getElementById('game-board');
    const timerDisplay = document.getElementById('timer');
    const board = document.getElementById('board');
    const currentWordDisplay = document.getElementById('current-word');
    const foundWordsDisplay = document.getElementById('found-words');
    const scoreDisplay = document.getElementById('score');
    const showRankingButton = document.getElementById('show-ranking');
    const modal = document.getElementById('modal');
    const closeModalButton = document.querySelector('.close');
    const rankingContent = document.getElementById('ranking-content');
    const submitWordButton = document.getElementById('submit-word');
    const feedbackDisplay = document.getElementById('feedback');

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

    const wordsList = ['test', 'example', 'word']; // Lista de palabras válidas para el juego (placeholder)

    startGameButton.addEventListener('click', () => {
        playerName = playerNameInput.value.trim();
        if (playerName.length < 3) {
            alert('El nombre debe tener al menos 3 letras.');
            return;
        }

        const timeLimit = parseInt(timeLimitSelect.value, 10);
        timeLeft = timeLimit * 60;
        score = 0;
        currentWord = '';
        foundWords = [];
        boardLetters = generateBoard();
        selectedCells = [];
        lastSelectedCell = null;

        gameSetupSection.style.display = 'none';
        gameBoardSection.style.display = 'block';

        updateDisplay();
        startTimer();
    });

    function generateBoard() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const boardLetters = [];
        board.innerHTML = '';

        for (let i = 0; i < boardSize; i++) {
            boardLetters[i] = [];
            for (let j = 0; j < boardSize; j++) {
                const letter = letters.charAt(Math.floor(Math.random() * letters.length));
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

    function handleCellClick(event) {
        const cell = event.target;
        const row = parseInt(cell.dataset.row, 10);
        const col = parseInt(cell.dataset.col, 10);

        if (selectedCells.some(c => c.row === row && c.col === col)) {
            return; // Ya está seleccionada
        }

        if (lastSelectedCell && !isContiguous(lastSelectedCell, { row, col })) {
            return; // No es contigua a la última seleccionada
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
        // Actualiza el tablero
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

            if (!selectedCells.some(c => c.row === row && c.col === col) && isContiguous(lastSelectedCell || {}, { row, col })) {
                cell.classList.add('next-selectable');
            }
        });

        currentWordDisplay.textContent = `Palabra actual: ${currentWord}`;
        foundWordsDisplay.innerHTML = `Palabras encontradas: ${foundWords.join(', ')}`;
        scoreDisplay.textContent = `Puntuación: ${score}`;
    }

    function startTimer() {
        clearInterval(timer);
        timer = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();

            if (timeLeft <= 0) {
                clearInterval(timer);
                endGame();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        timerDisplay.textContent = `Tiempo restante: ${Math.floor(timeLeft / 60)}:${timeLeft % 60 < 10 ? '0' : ''}${timeLeft % 60}`;

        if (timeLeft <= 10) {
            timerDisplay.classList.add('warning');
        } else {
            timerDisplay.classList.remove('warning');
        }
    }

    function endGame() {
        alert('¡Se acabó el tiempo!');
        saveGameResult();
        resetGame();
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

    function resetGame() {
        gameSetupSection.style.display = 'block';
        gameBoardSection.style.display = 'none';
        currentWord = '';
        foundWords = [];
        selectedCells = [];
        lastSelectedCell = null;
        playerNameInput.value = '';
        timeLimitSelect.value = '1';
        timerDisplay.classList.remove('warning');
        updateDisplay();
    }

    showRankingButton.addEventListener('click', () => {
        displayRanking();
        modal.style.display = 'block';
    });

    closeModalButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    submitWordButton.addEventListener('click', () => {
        if (currentWord.length < 3) {
            displayFeedback('¡La palabra debe tener al menos 3 letras!', 'incorrect');
            return;
        }

        if (foundWords.includes(currentWord)) {
            displayFeedback('¡Ya has encontrado esta palabra!', 'incorrect');
            return;
        }

        if (wordsList.includes(currentWord.toLowerCase())) {
            const wordScore = currentWord.length; // Ejemplo de puntuación basada en la longitud de la palabra
            score += wordScore;
            foundWords.push(currentWord);
            displayFeedback('¡Palabra correcta!', 'correct');
        } else {
            displayFeedback('¡Palabra incorrecta!', 'incorrect');
        }

        currentWord = '';
        selectedCells = [];
        lastSelectedCell = null;
        updateDisplay();
    });

    function displayFeedback(message, type) {
        feedbackDisplay.textContent = message;
        feedbackDisplay.style.color = type === 'correct' ? 'green' : 'red';
        feedbackDisplay.style.display = 'block';

        setTimeout(() => {
            feedbackDisplay.style.display = 'none';
        }, 2000); // Oculta el mensaje después de 2 segundos
    }

    function displayRanking() {
        const gameResults = JSON.parse(localStorage.getItem('gameResults')) || [];
        gameResults.sort((a, b) => b.score - a.score);

        rankingContent.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Puntuación</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    ${gameResults.map(result => `
                        <tr>
                            <td>${result.playerName}</td>
                            <td>${result.score}</td>
                            <td>${result.date}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
});
