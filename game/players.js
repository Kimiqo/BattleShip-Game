// Player.js
import Gameboard from './gameboard.js';
import AudioManager from './audioManager.js';
import DifficultySelector from './difficultySelector.js';

export default class Player {
    constructor(name, ships) {
        this.name = name;
        this.gameboard = new Gameboard(ships);
        this.isComputer = name === "Computer";
        this.lastHit = null;
        this.potentialTargets = [];
    }

    getName() {
        return this.name;
    }

    getGameboard() {
        return this.gameboard;
    }

    attack(opponent, row, col) {
        if (!opponent.gameboard.isValidAttack(row, col)) {
            return false;
        }
        const hit = opponent.gameboard.receiveAttack(row, col);
        
        // Get the ship at this position
        const ship = opponent.gameboard.getShipAt(row, col);
        
        // Play hit/miss sound
        AudioManager.play(hit ? 'hit' : 'miss');
        
        // Mark ship as sunk if needed
        if (hit && ship && ship.isSunk()) {
            opponent.gameboard.markShipAsSunk(ship);
        }
        
        return hit;
    }

    getProbabilityMap(opponent) {
        const probMap = Array(10).fill().map(() => Array(10).fill(0));
        const remainingShipLengths = [6, 5, 4, 3, 2].filter(length => 
            !opponent.gameboard.sunkShips.has(opponent.gameboard.ships.find(s => s.length === length))
        );

        // Calculate probability for each cell
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                if (!opponent.gameboard.isValidAttack(row, col)) continue;

                // Check horizontal placements
                remainingShipLengths.forEach(length => {
                    for (let offset = 0; offset < length; offset++) {
                        if (this.canPlaceShip(opponent, length, row, col - offset, true)) {
                            probMap[row][col]++;
                        }
                    }
                });

                // Check vertical placements
                remainingShipLengths.forEach(length => {
                    for (let offset = 0; offset < length; offset++) {
                        if (this.canPlaceShip(opponent, length, row - offset, col, false)) {
                            probMap[row][col]++;
                        }
                    }
                });
            }
        }

        return probMap;
    }

    canPlaceShip(opponent, length, startRow, startCol, isHorizontal) {
        // Check if all cells in the potential ship placement are valid
        for (let i = 0; i < length; i++) {
            const row = isHorizontal ? startRow : startRow + i;
            const col = isHorizontal ? startCol + i : startCol;

            if (row < 0 || row >= 10 || col < 0 || col >= 10) return false;
            if (!opponent.gameboard.isValidAttack(row, col) && 
                !opponent.gameboard.hits.some(([r, c]) => r === row && c === col)) {
                return false;
            }
        }
        return true;
    }

    makeSmartRandomMove(opponent) {
        const probMap = this.getProbabilityMap(opponent);
        let maxProb = 0;
        let bestMoves = [];

        // Find highest probability moves
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                if (!opponent.gameboard.isValidAttack(row, col)) continue;
                
                if (probMap[row][col] > maxProb) {
                    maxProb = probMap[row][col];
                    bestMoves = [[row, col]];
                } else if (probMap[row][col] === maxProb) {
                    bestMoves.push([row, col]);
                }
            }
        }

        // Choose a random move from the best moves
        const [row, col] = bestMoves[Math.floor(Math.random() * bestMoves.length)];
        this.attack(opponent, row, col);
        return [row, col];
    }

    computerMove(opponent) {
        if (!this.isComputer) return null;

        const difficulty = DifficultySelector.getDifficultySettings();
        
        // On easier difficulties, sometimes make random moves
        if (Math.random() > difficulty.hitChance) {
            let row, col;
            do {
                row = Math.floor(Math.random() * 10);
                col = Math.floor(Math.random() * 10);
            } while (!opponent.gameboard.isValidAttack(row, col));
            
            this.attack(opponent, row, col);
            return [row, col];
        }

        // If we have potential targets from a previous hit, try those first
        if (this.potentialTargets.length > 0) {
            // Sort targets by priority (prefer targets in line with multiple hits)
            this.potentialTargets.sort((a, b) => {
                const aScore = this.getTargetScore(a[0], a[1]);
                const bScore = this.getTargetScore(b[0], b[1]);
                return bScore - aScore;
            });

            while (this.potentialTargets.length > 0) {
                const target = this.potentialTargets.pop();
                if (opponent.gameboard.isValidAttack(target[0], target[1])) {
                    const hit = this.attack(opponent, target[0], target[1]);
                    if (hit) {
                        this.lastHit = target;
                        if (!this.hits) this.hits = [];
                        this.hits.push(target);
                        this.updateTargetsBasedOnHits();
                    }
                    return target;
                }
            }
        }

        // If we have multiple hits but no valid targets, try to find the ship's direction
        if (this.hits && this.hits.length >= 2) {
            const newTargets = this.findShipEndpoints();
            if (newTargets.length > 0) {
                this.potentialTargets = newTargets;
                return this.computerMove(opponent); // Try again with new targets
            }
        }

        // If no valid targets, make a probability-based move
        return this.makeSmartRandomMove(opponent);
    }

    findShipEndpoints() {
        const targets = [];
        const hits = [...this.hits].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        
        // Check if hits are in a line
        const isVertical = hits.every((hit, i) => 
            i === 0 || hit[1] === hits[0][1]
        );
        const isHorizontal = hits.every((hit, i) => 
            i === 0 || hit[0] === hits[0][0]
        );

        if (isVertical) {
            const col = hits[0][1];
            const minRow = Math.min(...hits.map(h => h[0]));
            const maxRow = Math.max(...hits.map(h => h[0]));
            if (minRow > 0) targets.push([minRow - 1, col]);
            if (maxRow < 9) targets.push([maxRow + 1, col]);
        } else if (isHorizontal) {
            const row = hits[0][0];
            const minCol = Math.min(...hits.map(h => h[1]));
            const maxCol = Math.max(...hits.map(h => h[1]));
            if (minCol > 0) targets.push([row, minCol - 1]);
            if (maxCol < 9) targets.push([row, maxCol + 1]);
        }

        return targets;
    }

    getTargetScore(row, col) {
        if (!this.hits || this.hits.length < 2) return 1;

        // Check if this target is in line with multiple hits
        const hitRows = this.hits.map(h => h[0]);
        const hitCols = this.hits.map(h => h[1]);

        // If we have multiple hits in the same row
        if (hitRows.every(r => r === row)) {
            return 3;
        }

        // If we have multiple hits in the same column
        if (hitCols.every(c => c === col)) {
            return 3;
        }

        return 1;
    }

    updateTargetsBasedOnHits() {
        if (!this.hits || this.hits.length < 2) {
            // If only one hit, add all adjacent targets
            const lastHit = this.hits[this.hits.length - 1];
            this.addAdjacentTargets(lastHit[0], lastHit[1]);
            return;
        }

        // Get the last two hits to determine direction
        const lastHit = this.hits[this.hits.length - 1];
        const prevHit = this.hits[this.hits.length - 2];

        // Check if hits are in the same row
        if (lastHit[0] === prevHit[0]) {
            const row = lastHit[0];
            const minCol = Math.min(...this.hits.map(h => h[1]));
            const maxCol = Math.max(...this.hits.map(h => h[1]));

            // Add targets in line with the hits
            if (minCol > 0) this.addTarget(row, minCol - 1);
            if (maxCol < 9) this.addTarget(row, maxCol + 1);
        }
        // Check if hits are in the same column
        else if (lastHit[1] === prevHit[1]) {
            const col = lastHit[1];
            const minRow = Math.min(...this.hits.map(h => h[0]));
            const maxRow = Math.max(...this.hits.map(h => h[0]));

            // Add targets in line with the hits
            if (minRow > 0) this.addTarget(minRow - 1, col);
            if (maxRow < 9) this.addTarget(maxRow + 1, col);
        }
    }

    addTarget(row, col) {
        if (row >= 0 && row < 10 && col >= 0 && col < 10 &&
            !this.gameboard.missedShots.some(([r, c]) => r === row && c === col) &&
            !this.gameboard.hits.some(([r, c]) => r === row && c === col)) {
            if (!this.potentialTargets) this.potentialTargets = [];
            this.potentialTargets.push([row, col]);
        }
    }

    addAdjacentTargets(row, col) {
        const adjacent = [
            [row - 1, col], // North
            [row + 1, col], // South
            [row, col - 1], // West
            [row, col + 1]  // East
        ];
        
        this.potentialTargets = [];
        adjacent.forEach(([r, c]) => this.addTarget(r, c));
    }

    updateTargetsBasedOnHitDirection() {
        if (!this.hits || this.hits.length < 2) return;

        // Find the direction of the hits
        const lastHit = this.hits[this.hits.length - 1];
        const previousHit = this.hits[this.hits.length - 2];
        
        // Calculate direction
        const rowDiff = lastHit[0] - previousHit[0];
        const colDiff = lastHit[1] - previousHit[1];
        
        // Clear existing targets and add new ones in the same direction
        this.potentialTargets = [];
        
        // Add targets in both directions along the line
        const nextForward = [lastHit[0] + rowDiff, lastHit[1] + colDiff];
        const nextBackward = [previousHit[0] - rowDiff, previousHit[1] - colDiff];
        
        if (nextForward[0] >= 0 && nextForward[0] < 10 && 
            nextForward[1] >= 0 && nextForward[1] < 10) {
            this.potentialTargets.push(nextForward);
        }
        
        if (nextBackward[0] >= 0 && nextBackward[0] < 10 && 
            nextBackward[1] >= 0 && nextBackward[1] < 10) {
            this.potentialTargets.push(nextBackward);
        }
    }
}
