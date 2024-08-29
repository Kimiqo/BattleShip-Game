export default class Ship{
    constructor(ship_len,hit_num = 0, sunk = false ){
        this.ship_len = ship_len;
        this.hit_num = hit_num;
        this.sunk = sunk;
    }

    hit(){
        return this.hit_num += 1;
    }

    isSunk(){
        if (this.hit_num === this.ship_len){
            return true;
        }else{
            return false;
        }
    }
}
