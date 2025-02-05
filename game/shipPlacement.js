import AudioManager from './audioManager.js';

export default class ShipPlacement {
    static isPlacementPhase = true;
    static currentShipIndex = 0;
    static isVertical = false;
    static ships = [];

    static init(ships, onComplete) {
        this.ships = ships;
        this.onComplete = onComplete;
        this.isPlacementPhase = true;
        this.currentShipIndex = 0;
        this.createPlacementUI();
    }

    static createPlacementUI() {
        const container = document.createElement('div');
        container.className = 'placement-container';
        
        const instructions = document.createElement('div');
        instructions.className = 'placement-instructions';
        instructions.innerHTML = `
            <h3>Place Your Ships</h3>
            <p>Click to place ship, press R to rotate</p>
            <p>Current ship length: <span class="current-ship-length">${this.ships[0].length}</span></p>
        `;

        const rotateBtn = document.createElement('button');
        rotateBtn.className = 'rotate-button';
        rotateBtn.textContent = 'Rotate Ship (R)';
        rotateBtn.onclick = () => this.rotateShip();

        container.appendChild(instructions);
        container.appendChild(rotateBtn);

        document.querySelector('main').insertBefore(container, document.querySelector('.game-container'));

        // Add keyboard listener for rotation
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'r') {
                this.rotateShip();
            }
        });
    }

    static rotateShip() {
        this.isVertical = !this.isVertical;
        this.updatePreview();
    }

    static updatePreview() {
        const cells = document.querySelectorAll('.game_grid > div');
        cells.forEach(cell => cell.classList.remove('preview'));
    }

    static handleHover(event, row, col) {
        if (!this.isPlacementPhase) return;
        
        const currentShip = this.ships[this.currentShipIndex];
        if (!currentShip) return;

        this.updatePreview();
        if (this.canPlaceShip(currentShip, row, col)) {
            const cells = this.getShipCells(currentShip, row, col);
            cells.forEach(cell => cell.classList.add('preview'));
        }
    }

    static handleClick(event, row, col) {
        if (!this.isPlacementPhase) return;
        
        const currentShip = this.ships[this.currentShipIndex];
        if (!currentShip) return;

        if (this.placeShip(currentShip, row, col)) {
            AudioManager.play('placement');
            this.currentShipIndex++;
            
            if (this.currentShipIndex >= this.ships.length) {
                this.completePlacement();
            } else {
                document.querySelector('.current-ship-length').textContent = 
                    this.ships[this.currentShipIndex].length;
            }
        }
    }

    static canPlaceShip(ship, row, col) {
        const length = ship.length;
        const board = document.querySelector('.game_grid');
        
        for (let i = 0; i < length; i++) {
            const newRow = this.isVertical ? row + i : row;
            const newCol = this.isVertical ? col : col + i;
            
            if (newRow >= 10 || newCol >= 10) return false;
            
            const cell = board.children[newRow * 10 + newCol];
            if (cell.classList.contains('placed')) return false;
        }
        return true;
    }

    static placeShip(ship, row, col) {
        if (!this.canPlaceShip(ship, row, col)) return false;

        const cells = this.getShipCells(ship, row, col);
        cells.forEach(cell => {
            cell.classList.add('placed');
            cell.dataset.value = 'O';
        });

        // Update the ship's position in the gameboard
        const positions = [];
        for (let i = 0; i < ship.length; i++) {
            const newRow = this.isVertical ? row + i : row;
            const newCol = this.isVertical ? col : col + i;
            positions.push([newRow, newCol]);
        }
        
        // Store the ship's position
        if (!this.placedShipPositions) {
            this.placedShipPositions = [];
        }
        this.placedShipPositions.push({
            ship: ship,
            positions: positions
        });

        return true;
    }

    static getShipCells(ship, row, col) {
        const board = document.querySelector('.game_grid');
        const cells = [];
        
        for (let i = 0; i < ship.length; i++) {
            const newRow = this.isVertical ? row + i : row;
            const newCol = this.isVertical ? col : col + i;
            cells.push(board.children[newRow * 10 + newCol]);
        }
        
        return cells;
    }

    static completePlacement() {
        this.isPlacementPhase = false;
        const placementUI = document.querySelector('.placement-container');
        if (placementUI) {
            placementUI.remove();
        }

        // Update the gameboard with all placed ships
        const playerBoard = document.querySelector('.game_grid');
        const gameboard = window.p1.gameboard;
        
        // Clear existing ships
        gameboard.board = Array(10).fill().map(() => Array(10).fill(""));
        gameboard.shipPositions = [];
        
        // Add placed ships
        this.placedShipPositions.forEach(({ship, positions}) => {
            gameboard.shipPositions.push(positions);
            positions.forEach(([row, col]) => {
                gameboard.board[row][col] = "O";
            });
        });

        if (this.onComplete) {
            this.onComplete();
        }
    }
}
