import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { SudokuGame } from '../../models/sudoku-game.model';
import { GameService } from '../../services/game.service';
import { UiUtilService } from '../../services/ui-util.service';
import { GameStatus } from '../../enums/game-status';
import { MatButtonModule } from '@angular/material/button';
import { HostGameComponent } from '../host-game/host-game.component';
import { GameStateService } from '../../services/game-state.service';
import { Router } from '@angular/router';
import { GameplayService } from '../../services/gameplay.service';
import { AuthService } from '../../services/auth.service';
import { Level } from '../../enums/level';
import { GameType } from '../../enums/game-type';

@Component({
  selector: 'app-multiplayer-screen',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, HostGameComponent],
  templateUrl: './multiplayer-screen.component.html',
  styleUrl: './multiplayer-screen.component.css'
})
export class MultiplayerScreenComponent implements OnInit {
  gameService: GameService = inject(GameService);
  gameStateService: GameStateService = inject(GameStateService);
  authService: AuthService = inject(AuthService);
  uiUtilService: UiUtilService = inject(UiUtilService);
  gameplayService: GameplayService = inject(GameplayService);
  router: Router = inject(Router);

  activeGameList!: SudokuGame[];
  onlinePlayerCount: number = 0;

  ngOnInit(): void {
    this.fetchActiveGames();
    this.fetchOnlinePlayerCount();
  }

  fetchActiveGames() {
    this.gameService.fetchActiveGames()
      .subscribe({
        next: (gameList: SudokuGame[]) => {
          let gameArr: SudokuGame[] = [];
          for (let game of gameList) {
            const gameStatus = GameStatus[game.status as unknown as keyof typeof GameStatus];
            if (gameStatus === GameStatus.NEW || gameStatus === GameStatus.RUNNING) {
              gameArr.push(game);
            }
          }
          this.activeGameList = gameArr;
        },
        error: (error) => {
          this.uiUtilService.showSnackBar(error, "Ok", 10);
        }
      });
  }

  joinGame(index: number) {

    const game: SudokuGame = this.activeGameList[index];
    if (game.playerCount >= game.playerLimit) {
      this.uiUtilService.showSnackBar("Game is Full, cannot join.", "Ok", 5);
    }
    else {
      this.gameStateService.saveJoinGameId(game.gameId);
      this.gameStateService.saveGameType(GameType.MULTI);

      this.router.navigate(['game-screen']);
    }

  }

  getLevelName(levelKey: string): string {
    return Level[levelKey as keyof typeof Level];
  }

  fetchOnlinePlayerCount() {
    this.gameService.fetchOnlinePlayerCount()
      .subscribe({
        next: (onlinePlayerCount) => {
          this.onlinePlayerCount = onlinePlayerCount;
        },
        error: (err) => {
          this.uiUtilService.showSnackBar(err, "Ok", 8);
        }
      });
  }

}
