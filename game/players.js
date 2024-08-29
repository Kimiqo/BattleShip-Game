import Gameboard from "./gameboard.js";

export default class Player{
    constructor(name){
        this.player = name;
        this.playerboard = new Gameboard();
    }

    name(){
        return this.player;
    }

}

