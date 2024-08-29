import Ship from "./ship.js";

export default class Gameboard {
    constructor() {
        this.board = Array(10).fill().map(() => Array(10).fill("-"));
        this.placeShips();
    }

    placeShips() {
        const ships = [
            new Ship(5), // Carrier
            new Ship(4), // Battleship
            new Ship(3), // Destroyer 1
            new Ship(3), // Destroyer 2
            new Ship(2), // Submarine
            new Ship(1)  // Patrol Boat
        ];

        ships.forEach(ship => {
            let placed = false;
            while (!placed) {
                const startRow = Math.floor(Math.random() * 10);
                const startCol = Math.floor(Math.random() * 10);
                if (this.canPlaceShip(ship, startRow, startCol)) {
                    this.setShip(ship, startRow, startCol);
                    placed = true;
                }
            }
        });
    }

    canPlaceShip(ship, row, col) {
        if (col + ship.ship_len > 10) return false;
        for (let index = 0; index < ship.ship_len; index++) {
            if (this.board[row][col + index] !== "-") return false;
        }
        return true;
    }

    setShip(ship, row, col) {
        for (let index = 0; index < ship.ship_len; index++) {
            this.board[row][col + index] = "B";
        }
    }
}
