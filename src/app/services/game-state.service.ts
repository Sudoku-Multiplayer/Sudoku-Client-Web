import { Injectable, inject } from "@angular/core";
import { GameOptions } from "../models/game-options.model";
import { Player } from "../models/player.model";
import { UiUtilService } from "./ui-util.service";
import { GameService } from "./game.service";
import { JoinGameResponse } from "../models/join-game-response.model";
import { Router } from "@angular/router";
import { GameType } from "../enums/game-type";
import { JoinOrHost } from "../enums/join-or-host";
import { SudokuGame } from "../models/sudoku-game.model";

@Injectable({
    providedIn: 'root'
})
export class GameStateService {

    private readonly GAMETYPE_KEY = "gametype";
    private readonly SUDOKUGAME_KEY = "sudokugame";
    private readonly PLAYER_KEY = "player";
    private readonly GAMEOPTIONS_KEY = "gameoptions";
    private readonly JOIN_OR_HOST_KEY = "joinorhost";
    private readonly JOINGAMERESPONSE_KEY = "joingameresponse";
    private readonly GAMEID_KEY = "gameid";

    joinGameResponse!: JoinGameResponse;
    private currentPlayer: Player | null = null;
    private gameOptions: GameOptions | null = null;
    private joinOrHost: JoinOrHost | null = null;

    uiUtilService: UiUtilService = inject(UiUtilService);
    gameService: GameService = inject(GameService);
    router: Router = inject(Router);

    saveGameOptions(gameOptions: GameOptions) {
        this.gameOptions = gameOptions;
        sessionStorage.setItem(this.GAMEOPTIONS_KEY, JSON.stringify(gameOptions));
    }

    getGameOptions(): GameOptions | null {
        if (this.gameOptions) {
            return this.gameOptions;
        }

        const gameOptionsJson = sessionStorage.getItem(this.GAMEOPTIONS_KEY);
        if (gameOptionsJson) {
            return JSON.parse(gameOptionsJson);
        }

        return null;
    }

    removeGameOptions() {
        this.gameOptions = null;
        sessionStorage.removeItem(this.GAMEOPTIONS_KEY);
    }

    saveGameType(gameType: GameType) {
        sessionStorage.setItem(this.GAMETYPE_KEY, JSON.stringify(gameType));
    }

    getGameType(): GameType | null {
        const gameTypeJson = sessionStorage.getItem(this.GAMETYPE_KEY);
        if (gameTypeJson) {
            return JSON.parse(gameTypeJson);
        }
        return null;
    }

    removeGameType() {
        sessionStorage.removeItem(this.GAMETYPE_KEY);
    }

    saveJoinGameId(gameId: string) {
        sessionStorage.setItem(this.GAMEID_KEY, gameId);
    }

    getJoinGameId(): string | null {
        return sessionStorage.getItem(this.GAMEID_KEY);
    }

    removeJoinGameId() {
        sessionStorage.removeItem(this.GAMEID_KEY);
    }

    saveCurrentSudokuGame(game: SudokuGame) {
        sessionStorage.setItem(this.SUDOKUGAME_KEY, JSON.stringify(game));
    }

    getCurrentSudokuGame(): SudokuGame | null {
        const gameJson = sessionStorage.getItem(this.SUDOKUGAME_KEY);
        if (gameJson) {
            return JSON.parse(gameJson);
        }

        return null;
    }

    removeCurrentSudokuGame() {
        sessionStorage.removeItem(this.SUDOKUGAME_KEY);
    }

    saveJoinOrHost(joinOrHost: JoinOrHost) {
        this.joinOrHost = joinOrHost;
        sessionStorage.setItem(this.JOIN_OR_HOST_KEY, JSON.stringify(joinOrHost));
    }

    getJoinOrHost(): JoinOrHost | null {
        if (this.joinOrHost) {
            return this.joinOrHost;
        }

        const joinOrHostJson = sessionStorage.getItem(this.JOIN_OR_HOST_KEY);
        if (joinOrHostJson) {
            return this.joinOrHost = JSON.parse(joinOrHostJson);
        }

        return null;
    }

    removeJoinOrHost() {
        this.joinOrHost = null;
        sessionStorage.removeItem(this.JOIN_OR_HOST_KEY);
    }

    canEnterGameScreenForMultiplayer(): boolean {
        if (this.getJoinGameId() && this.getGameType()! === GameType.MULTI) {
            return true;
        }

        return false;
    }

    canEnterGameScreenForSingleplayer(): boolean {
        if (this.gameOptions || this.getGameOptions()) {
            return true;
        }

        return false;
    }

    saveJoinGameResponse(joinGameResponse: JoinGameResponse) {
        sessionStorage.setItem(this.JOINGAMERESPONSE_KEY, JSON.stringify(joinGameResponse));
    }

    getJoinGameResponse(): JoinGameResponse | null {
        const joinGameResponseJson = sessionStorage.getItem(this.JOINGAMERESPONSE_KEY);
        if (joinGameResponseJson) {
            return JSON.parse(joinGameResponseJson);
        }

        return null;
    }

    removeJoinGameResponse() {
        sessionStorage.removeItem(this.JOINGAMERESPONSE_KEY);
    }

    savePlayer(player: Player, localSave: boolean) {
        this.currentPlayer = player;
        if (localSave) {
            localStorage.setItem(this.PLAYER_KEY, JSON.stringify(player));
        }
        else {
            sessionStorage.setItem(this.PLAYER_KEY, JSON.stringify(player));
        }
    }

    isPlayerLocallySaved(): boolean {
        let playerJson = localStorage.getItem(this.PLAYER_KEY);
        if (playerJson) {
            return true;
        }

        return false;
    }

    getCurrentPlayer(): Player | null {
        if (this.currentPlayer) {
            return this.currentPlayer;
        }

        let playerJson = localStorage.getItem(this.PLAYER_KEY);
        if (playerJson) {
            this.currentPlayer = JSON.parse(playerJson);
            return this.currentPlayer;
        }

        playerJson = sessionStorage.getItem(this.PLAYER_KEY);
        if (playerJson) {
            this.currentPlayer = JSON.parse(playerJson);
            return this.currentPlayer;
        }

        return null;
    }

    removeCurrentPlayer(): void {
        this.currentPlayer = null;
        localStorage.removeItem(this.PLAYER_KEY);
        sessionStorage.removeItem(this.PLAYER_KEY);
    }

    removeCurrentGameSession() {
        this.removeCurrentSudokuGame();
        this.removeGameOptions();
        this.removeGameType();
        this.removeJoinOrHost();
        this.removeJoinGameResponse();
        this.removeJoinGameId();
    }

}