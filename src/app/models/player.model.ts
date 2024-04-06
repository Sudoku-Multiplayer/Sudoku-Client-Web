import { PlayerType } from "../enums/player-type";

export class Player{
    name: string;
    id: number;
    playerType: PlayerType;

    constructor(name: string, id: number, playerType: PlayerType){
        this.name = name;
        this.id = id;
        this.playerType = playerType;
    }
}