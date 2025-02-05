// main.js
import Player from '/game/players.js';
import Ship from '/game/ship.js';
import UI from '/game/UI.js';
import AudioManager from '/game/audioManager.js';
import DifficultySelector from '/game/difficultySelector.js';
import ShipPlacement from '/game/shipPlacement.js';
import Modals from '/game/modals.js';

const playerShips = [
    new Ship(6), 
    new Ship(5), 
    new Ship(4), 
    new Ship(3), 
    new Ship(2)
];

const compShips = [
    new Ship(6), 
    new Ship(5), 
    new Ship(4), 
    new Ship(3), 
    new Ship(2)
];

// Make p1 globally available for ship placement
window.p1 = new Player("Johnny", playerShips);
window.p2 = new Player("Computer", compShips);

// Alias for local use
const p1 = window.p1;
const p2 = window.p2;

// Initialize audio and modals
AudioManager.init();
Modals.init();

const main = document.querySelector("main");
const gameStatus = document.createElement("div");
const gameContainer = document.createElement("div");

// Create difficulty selector
const difficultyContainer = document.createElement("div");
difficultyContainer.className = "controls-container";
difficultyContainer.appendChild(DifficultySelector.createSelector());

// Create player board container
const playerBoardContainer = document.createElement("div");
const playerTitle = document.createElement("div");
const playerGrid = document.createElement("div");

// Create computer board container
const compBoardContainer = document.createElement("div");
const compTitle = document.createElement("div");
const compGrid = document.createElement("div");

// Set classes
gameStatus.className = "game-status";
gameContainer.className = "game-container";
playerBoardContainer.className = "board-container";
compBoardContainer.className = "board-container";
playerGrid.className = "game_grid";
compGrid.className = "game_grid";
playerTitle.className = "board-title";
compTitle.className = "board-title";

// Set titles
playerTitle.textContent = "YOUR FLEET";
compTitle.textContent = "ENEMY WATERS";

// Assemble the board containers
playerBoardContainer.appendChild(playerTitle);
playerBoardContainer.appendChild(playerGrid);
compBoardContainer.appendChild(compTitle);
compBoardContainer.appendChild(compGrid);

let currentPlayer = p1;
let gameOver = false;

function showGameOverModal(isWinner) {
    const modal = document.getElementById('gameOverModal');
    const title = document.getElementById('gameOverTitle');
    const message = document.getElementById('gameOverMessage');
    const icon = document.getElementById('gameOverIcon');
    const hitCount = document.getElementById('hitCount');
    const missCount = document.getElementById('missCount');
    const accuracy = document.getElementById('accuracy');
    const restartButton = document.getElementById('restartButton');

    // Update content
    title.textContent = isWinner ? 'Victory!' : 'Game Over';
    message.textContent = isWinner ? 
        'Congratulations! You have defeated the enemy fleet!' :
        'Your fleet has been destroyed! Better luck next time!';
    icon.className = `game-over-icon ${isWinner ? 'win' : 'lose'}`;

    // Calculate stats
    const hits = p2.gameboard.hits.length;
    const misses = p2.gameboard.missedShots.length;
    const totalShots = hits + misses;
    const accuracyValue = totalShots > 0 ? Math.round((hits / totalShots) * 100) : 0;

    // Update stats
    hitCount.textContent = hits;
    missCount.textContent = misses;
    accuracy.textContent = `${accuracyValue}%`;

    // Show modal
    modal.classList.add('show');
    modal.style.display = 'block';

    // Handle restart
    restartButton.onclick = () => {
        modal.classList.remove('show');
        modal.style.display = 'none';
        window.location.reload();
    };

    // Close button
    modal.querySelector('.close-modal').onclick = () => {
        modal.classList.remove('show');
        modal.style.display = 'none';
    };
}

function updateStatus(message) {
    gameStatus.textContent = message;
    
    // Check for game over
    if (p1.gameboard.allShipsSunk()) {
        showGameOverModal(false);
    } else if (p2.gameboard.allShipsSunk()) {
        showGameOverModal(true);
    }
}

function handleCellClick(event, row, col) {
    if (gameOver || currentPlayer !== p1) return;

    if (p1.attack(p2, row, col)) {
        const cell = event.target;
        const hit = p2.gameboard.hits.some(([r, c]) => r === row && c === col);
        cell.classList.add(hit ? 'hit' : 'miss');
        cell.textContent = hit ? 'X' : 'M';

        if (p2.gameboard.allShipsSunk()) {
            gameOver = true;
            updateStatus("Game Over - You Win!");
            showGameOverModal(true);
            return;
        }

        if (!hit) {
            currentPlayer = p2;
            updateStatus("Computer's turn");
            makeComputerMove();
        } else {
            updateStatus("Hit! Take another shot!");
        }
    }
}

function makeComputerMove() {
    setTimeout(() => {
        if (gameOver) return;

        const [compRow, compCol] = p2.computerMove(p1);
        const playerCell = playerGrid.children[compRow * 10 + compCol];
        const hit = p1.gameboard.hits.some(([r, c]) => r === compRow && c === compCol);
        
        playerCell.classList.add(hit ? 'hit' : 'miss');
        playerCell.textContent = hit ? 'X' : 'M';

        if (p1.gameboard.allShipsSunk()) {
            gameOver = true;
            updateStatus("Game Over - Computer Wins!");
            showGameOverModal(false);
            return;
        }

        if (hit) {
            updateStatus("Computer hit! They get another turn!");
            makeComputerMove(); // Computer gets another turn
        } else {
            currentPlayer = p1;
            updateStatus("Your turn");
        }
    }, 800);
}

// Initialize the game with ship placement phase
UI.createDivs(10, playerGrid, p1, (e, row, col) => {
    ShipPlacement.handleClick(e, row, col);
}, (e, row, col) => {
    ShipPlacement.handleHover(e, row, col);
});

UI.createDivs(10, compGrid, p2, handleCellClick);

main.appendChild(difficultyContainer);
main.appendChild(gameStatus);
gameContainer.appendChild(playerBoardContainer);
gameContainer.appendChild(compBoardContainer);
main.appendChild(gameContainer);

// Start with placement phase
ShipPlacement.init(playerShips, () => {
    updateStatus("Your turn");
    compGrid.style.opacity = "1";
});

// Hide computer's grid during placement
compGrid.style.opacity = "0.5";
updateStatus("Place your ships");

export default function comp() {
    return compGrid;
}
