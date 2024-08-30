// Player.js
import Gameboard from './gameboard.js';

export default class Player {
    constructor(name, ships) {
        this.name = name;
        this.gameboard = new Gameboard(ships);
    }

    getName() {
        return this.name;
    }

    getGameboard() {
        return this.gameboard;
    }
}
