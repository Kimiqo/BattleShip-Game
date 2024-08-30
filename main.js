// main.js
import Player from '/game/players.js';
import Ship from '/game/ship.js';
import UI from '/game/UI.js';

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

const p1 = new Player("Johnny", playerShips);
const p2 = new Player("Computer", compShips);

const main = document.querySelector("main");
const playerGrid = document.createElement("div");
const compGrid = document.createElement("div");
playerGrid.className = "game_grid";
compGrid.className = "game_grid";

UI.createDivs(10, playerGrid, p1);
UI.createDivs(10, compGrid, p2);

main.appendChild(playerGrid);
main.appendChild(compGrid);

export default function comp(){
    return compGrid;
}
