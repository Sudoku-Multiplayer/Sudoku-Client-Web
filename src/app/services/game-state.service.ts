import { Injectable } from "@angular/core";
import { GameOptions } from "../models/game-options.model";

@Injectable({
    providedIn: 'root'
})
export class GameStateService {

    private gameOptions!: GameOptions | null;
    registerGameOptions(gameOptions: GameOptions) {
        this.gameOptions = gameOptions;
    }

    removeGameOptions() {
        this.gameOptions = null;
    }

    hasGameOptions(): boolean {
        if (this.gameOptions) {
            return true;
        }

        return false;
    }

}