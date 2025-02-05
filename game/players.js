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

    makeSmartRandomMove(opponent) {
        // Try to attack in a checkerboard pattern first for efficiency
        for (let attempts = 0; attempts < 50; attempts++) {
            const row = Math.floor(Math.random() * 10);
            const col = Math.floor(Math.random() * 10);
            
            // Skip if not in checkerboard pattern
            if ((row + col) % 2 !== 0) continue;
            
            if (opponent.gameboard.isValidAttack(row, col)) {
                this.attack(opponent, row, col);
                return [row, col];
            }
        }

        // Fallback to completely random if checkerboard fails
        let row, col;
        do {
            row = Math.floor(Math.random() * 10);
            col = Math.floor(Math.random() * 10);
        } while (!opponent.gameboard.isValidAttack(row, col));
        
        this.attack(opponent, row, col);
        return [row, col];
    }

    computerMove(opponent) {
        if (!this.isComputer) return null;

        const difficulty = DifficultySelector.getDifficultySettings();
        
        // On easier difficulties, sometimes make random moves
        if (Math.random() > difficulty.hitChance) {
            return this.makeSmartRandomMove(opponent);
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

        // If no valid targets, make a smart random move
        return this.makeSmartRandomMove(opponent);
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
