export default class Gameboard {
    constructor(ships = []) {
        this.board = Array(10).fill().map(() => Array(10).fill(""));
        this.ships = ships;
        this.shipPositions = [];
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
}
