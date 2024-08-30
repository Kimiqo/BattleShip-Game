import comp from "../main.js"

export default class UI {
    static createDivs(num, gridType, player) {
        for (let x = 0; x < num; x++) {
            for (let i = 0; i < num; i++) {
                const gridBox = document.createElement('div');
                gridBox.dataset.value = player.getGameboard().board[x][i];
                gridBox.dataset.row = x;
                gridBox.dataset.col = i;
                gridBox.innerHTML = "";
                gridType.appendChild(gridBox);

                gridBox.addEventListener("click", () => {
                    if (gridType === comp()) {
                        this.handleCompGridClick(gridBox, player);
                    }
                });
            }
        }
    }

    static handleCompGridClick(gridBox, player) {
        if (gridBox.dataset.clicked) return;

        gridBox.dataset.clicked = true;

        const row = parseInt(gridBox.dataset.row);
        const col = parseInt(gridBox.dataset.col);

        if (gridBox.dataset.value === "") {
            gridBox.style.backgroundColor = 'red';
        } else if (gridBox.dataset.value === "O") {
            gridBox.style.backgroundColor = 'green';
            const ship = player.getGameboard().getShipAt(row, col);
            if (ship) {
                ship.hit();
                console.log(`Ship of length ${ship.length} was hit!`);

                if (ship.isSunk()) {
                    console.log(`Ship of length ${ship.length} has sunk!`);
                    const shipPositions = player.getGameboard().shipPositions.find(positions =>
                        positions.some(([r, c]) => r === row && c === col)
                    );

                    if (shipPositions) {
                        shipPositions.forEach(([r, c]) => {
                            const shipBox = comp().querySelector(`[data-row="${r}"][data-col="${c}"]`);
                            if (shipBox) {
                                shipBox.style.backgroundColor = 'gold';
                                shipBox.dataset.clicked = true;
                            }
                        });
                    }
                }
            }
        }

        gridBox.style.pointerEvents = 'none';
        if (player.getGameboard().allShipsSunk()) {
            this.endGame();
        }
    }

    static endGame() {
        // Create modal elements
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'modal-content';
        modal.innerHTML = `
                <p>Game Over!</p>
                <button id="restart">Restart</button>
            `;

        // Append modal to overlay
        overlay.appendChild(modal);
        document.getElementById('app').appendChild(overlay);

        // Handle restart button click
        const restartButton = document.getElementById('restart');
        restartButton.addEventListener('click', () => {
            location.reload(); // Reload the page to restart the game
        });

        // Handle Escape key press
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                overlay.remove();
            }
        });
    }
}

export function showModal(message) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <p>${message}</p>
            <button id="restart">Restart</button>
        </div>
    `;
    document.body.appendChild(modal);

    const restartButton = document.getElementById('restart');
    restartButton.addEventListener('click', () => {
        location.reload(); // Reload the page to restart the game
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}