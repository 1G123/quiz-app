let questions = [];
let players = [];

// Load questions from local storage
function loadQuestions() {
    let storedQuestions = JSON.parse(localStorage.getItem('questions')) || [];
    questions = storedQuestions;
    displayQuestions();
}

// Save questions to local storage
function saveQuestions() {
    localStorage.setItem('questions', JSON.stringify(questions));
}

// Load players from local storage
function loadPlayers() {
    let storedPlayers = JSON.parse(localStorage.getItem('players')) || [];
    players = storedPlayers;
    displayPlayers();
}

// Save players to local storage
function savePlayers() {
    localStorage.setItem('players', JSON.stringify(players));
}

// Add a question form to the host panel
function addQuestionForm() {
    const question = {
        question: '',
        answers: [],
        correctAnswer: null
    };
    questions.push(question);
    saveQuestions();
    displayQuestions();
}

// Display questions in the host panel
function displayQuestions() {
    const questionsContainer = document.getElementById('questions-container');
    questionsContainer.innerHTML = '';

    questions.forEach((question, index) => {
        let questionElement = document.createElement('div');
        questionElement.classList.add('question');
        questionElement.innerHTML = `
            <h3>Question ${index + 1}</h3>
            <input type="text" placeholder="Enter question" value="${question.question}" onchange="updateQuestion(${index}, this.value)">
            <div class="answers">
                ${question.answers.map((answer, i) => `
                    <div>
                        <input type="text" placeholder="Enter answer" value="${answer}" onchange="updateAnswer(${index}, ${i}, this.value)">
                        <input type="radio" name="correct${index}" ${question.correctAnswer === i ? 'checked' : ''} onclick="setCorrectAnswer(${index}, ${i})"> Correct
                    </div>
                `).join('')}
            </div>
            <button onclick="addAnswer(${index})">Add Answer</button>
        `;
        questionsContainer.appendChild(questionElement);
    });
}

// Update a question text
function updateQuestion(index, value) {
    questions[index].question = value;
    saveQuestions();
}

// Update an answer text
function updateAnswer(questionIndex, answerIndex, value) {
    questions[questionIndex].answers[answerIndex] = value;
    saveQuestions();
}

// Set the correct answer for a question
function setCorrectAnswer(questionIndex, answerIndex) {
    questions[questionIndex].correctAnswer = answerIndex;
    saveQuestions();
}

// Add an answer to a question
function addAnswer(index) {
    questions[index].answers.push('');
    saveQuestions();
    displayQuestions();
}

// Generate a game pin
function generateGamePin() {
    let gamePin = Math.floor(100000 + Math.random() * 900000);
    localStorage.setItem('gamePin', gamePin);
    alert(`Generated Game Pin: ${gamePin}`);
}

// Start the quiz
function startQuiz() {
    // Check if questions are added
    if (questions.length === 0) {
        alert('Please add questions first.');
        return;
    }

    // Check if players are added
    if (players.length === 0) {
        alert('No players have joined yet.');
        return;
    }

    // Set quiz status to 'inProgress'
    localStorage.setItem('quizStatus', 'inProgress');
    alert('Quiz Started!');
    localStorage.setItem('currentQuestionIndex', 0); // Reset the current question index

    // Notify players to start the quiz
    window.dispatchEvent(new Event('quizStarted'));
}

// Open results popup
function openResultsPopup() {
    let playerName = prompt('Enter player name to check results:');
    if (!playerName) return;

    let player = players.find(p => p.name === playerName);
    if (!player) {
        alert('Player not found.');
        return;
    }

    // Check highest score
    let highestScore = Math.max(...players.map(p => p.score));
    if (player.score === highestScore) {
        window.open('winner-screen.html', '_blank', 'fullscreen=yes');
    } else {
        let loserWindow = window.open('loser-screen.html', '_blank', 'fullscreen=yes');
        setTimeout(() => {
            loserWindow.close();
        }, 3000);
    }
}

// Display player names in the host panel
function displayPlayers() {
    const playersContainer = document.getElementById('players-container');
    playersContainer.innerHTML = '';

    players.forEach(player => {
        let playerElement = document.createElement('div');
        playerElement.classList.add('player');
        playerElement.textContent = player.name;
        playersContainer.appendChild(playerElement);
    });
}

// Load questions and players when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadQuestions();
    loadPlayers();
});

// Reset game data
function resetGame() {
    if (confirm('Are you sure you want to reset the game? This will clear all questions and player data.')) {
        localStorage.removeItem('questions');
        localStorage.removeItem('players');
        localStorage.removeItem('gamePin');
        localStorage.removeItem('quizStatus');
        localStorage.removeItem('currentQuestionIndex');
        localStorage.removeItem('currentPlayer');
        questions = [];
        players = [];
        displayQuestions();
        displayPlayers();
        alert('Game has been reset.');
    }
}

// Event listener for changes in localStorage to detect quiz start
window.addEventListener('storage', function(event) {
    if (event.key === 'players') {
        loadPlayers();
        displayPlayers();
    }
    if (event.key === 'quizStatus' && event.newValue === 'inProgress') {
        if (document.body.dataset.role === 'player') {
            window.location.href = 'quiz.html';
        }
    }
});

// Host login
function loginHost() {
    const password = document.getElementById('hostPassword').value;
    if (password === 'host123') {  // Change this to your desired password
        window.open('host-panel.html', '_blank');
    } else {
        alert('Incorrect password');
    }
}

// Join game
function joinGame() {
    const gamePin = document.getElementById('gamePin').value;
    const playerName = document.getElementById('playerName').value;
    const storedGamePin = localStorage.getItem('gamePin');

    if (gamePin === storedGamePin && playerName) {
        let player = { name: playerName, score: 0 };
        players.push(player);
        savePlayers();
        localStorage.setItem('currentPlayer', playerName);
        window.location.href = 'waiting-room.html';
    } else {
        alert('Invalid game pin or missing name');
    }
}

// Ensure all buttons have event listeners
document.getElementById('generatePinButton')?.addEventListener('click', generateGamePin);
document.getElementById('startQuizButton')?.addEventListener('click', startQuiz);
document.getElementById('resetButton')?.addEventListener('click', resetGame);
document.getElementById('checkResultsButton')?.addEventListener('click', openResultsPopup);

// Event listener for quiz start
window.addEventListener('quizStarted', function() {
    if (document.body.dataset.role === 'player') {
        window.location.href = 'quiz.html';
    }
});
