export default class Gameboard {
    constructor(ships = []) {
        this.board = Array(10).fill().map(() => Array(10).fill(""));
        this.ships = ships;
        this.shipPositions = [];
        this.missedShots = [];
        this.hits = [];
        this.sunkShips = new Set();
        this.placeShips();
    }

    placeShips() {
        this.ships.forEach(ship => {
            let placed = false;
            while (!placed) {
                const startRow = Math.floor(Math.random() * 10);
                const startCol = Math.floor(Math.random() * 10);
                if (this.canPlaceShip(ship, startRow, startCol)) {
                    this.setShip(ship, startRow, startCol);
                    this.shipPositions.push(
                        Array.from({ length: ship.length }, (_, i) => [startRow, startCol + i])
                    );
                    placed = true;
                }
            }
        });
    }

    canPlaceShip(ship, row, col) {
        if (col + ship.length > 10) return false;
        for (let index = 0; index < ship.length; index++) {
            if (this.board[row][col + index] !== "") return false;
        }
        return true;
    }

    setShip(ship, row, col) {
        for (let index = 0; index < ship.length; index++) {
            this.board[row][col + index] = "O";
        }
    }

    markShipAsSunk(ship) {
        this.sunkShips.add(ship);
        const positions = this.shipPositions.find(positions =>
            positions.some(([r, c]) => this.getShipAt(r, c) === ship)
        );

        if (positions) {
            positions.forEach(([row, col]) => {
                // Find the cell in the correct grid (computer's or player's)
                const grids = document.querySelectorAll('.game_grid');
                const grid = this.ships === window.p1.gameboard.ships ? grids[0] : grids[1];
                const cell = grid.children[row * 10 + col];
                if (cell) {
                    cell.classList.add('sunk');
                }
            });
        }
    }

    getShipAt(row, col) {
        const shipIndex = this.shipPositions.findIndex(positions =>
            positions.some(([r, c]) => r === row && c === col)
        );
        if (shipIndex !== -1) {
            return this.ships[shipIndex];
        }
        return null;
    }

    allShipsSunk() {
        return this.ships.every(ship => ship.isSunk());
    }

    receiveAttack(row, col) {
        if (this.hits.some(([r, c]) => r === row && c === col) || 
            this.missedShots.some(([r, c]) => r === row && c === col)) {
            return false; // Already attacked this position
        }

        const ship = this.getShipAt(row, col);
        if (ship) {
            this.hits.push([row, col]);
            ship.hit();
            this.board[row][col] = 'X'; // Mark as hit
            return true;
        } else {
            this.missedShots.push([row, col]);
            this.board[row][col] = 'M'; // Mark as miss
            return true;
        }
    }

    isValidAttack(row, col) {
        return row >= 0 && row < 10 && col >= 0 && col < 10 &&
            !this.hits.some(([r, c]) => r === row && c === col) &&
            !this.missedShots.some(([r, c]) => r === row && c === col);
    }
}
