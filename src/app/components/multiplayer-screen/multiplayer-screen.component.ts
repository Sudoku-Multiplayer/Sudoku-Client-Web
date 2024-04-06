import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { SudokuGame } from '../../models/sudoku-game.model';
import { GameService } from '../../services/game.service';
import { UiUtilService } from '../../services/ui-util.service';
import { GameStatus } from '../../enums/game-status';
import { MatButtonModule } from '@angular/material/button';
import { HostGameComponent } from '../host-game/host-game.component';
import { GameStateService } from '../../services/game-state.service';
import { Player } from '../../models/player.model';
import { Router } from '@angular/router';
import { JoinOrHost } from '../../enums/join-or-host';
import { GameplayService } from '../../services/gameplay.service';
import { AuthService } from '../../services/auth.service';
import { Level } from '../../enums/level';

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

  ngOnInit(): void {
    this.fetchActiveGames();
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
    let gameId: string = this.activeGameList[index].gameId;
    let currentPlayer: Player | null = this.gameStateService.getCurrentPlayer();

    if (currentPlayer) {
      this.gameStateService.joinGameAndNavigate(currentPlayer, gameId, JoinOrHost.JOIN);
    }
  }

  getLevelName(levelKey: string): string {
    return Level[levelKey as keyof typeof Level];
  }

}
