import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { MainMenuComponent } from "../main-menu/main-menu.component";
import { OptionsComponent } from '../options/options.component';
import { GameBoardComponent } from '../game-board/game-board.component';
import { GameOptions } from '../../models/game-options.model';
import { GameType } from '../../enums/game-type';
import { ChatComponent } from '../chat/chat.component';
import { BoardUpdatesComponent } from '../board-updates/board-updates.component';
import { BoardUpdate } from '../../models/board-update.model';
import { GameService } from '../../services/game.service';
import { UiUtilService } from '../../services/ui-util.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GameStateService } from '../../services/game-state.service';
import { CreateGameResponse } from '../../interfaces/create-game-response';
import { JoinOrHost } from '../../enums/join-or-host';
import { JoinGameResponse } from '../../models/join-game-response.model';
import { Subscription } from 'rxjs';
import { GameplayService } from '../../services/gameplay.service';
import { SudokuGame } from '../../models/sudoku-game.model';
import { UtilService } from '../../services/util.service';
import { GameChatMessage } from '../../models/game-chat-message.model';
import { Player } from '../../models/player.model';
import { ServerConfig } from '../../configs/server.config';
import { AuthService } from '../../services/auth.service';
import { GameBoard } from '../../models/game-board.model';
import { GameStatus } from '../../enums/game-status';
import { Level } from '../../enums/level';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../ui/confirmation-dialog/confirmation-dialog.component';
import { WebsocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-game-screen',
  standalone: true,
  templateUrl: './game-screen.component.html',
  styleUrl: './game-screen.component.css',
  imports: [MainMenuComponent,
    OptionsComponent,
    GameBoardComponent,
    ChatComponent,
    BoardUpdatesComponent,
    MatProgressSpinnerModule,
    MatButtonModule]
})
export class GameScreenComponent implements OnInit, OnDestroy {

  gameService: GameService = inject(GameService);
  gameStateService: GameStateService = inject(GameStateService);
  authService: AuthService = inject(AuthService);
  uiUtilService: UiUtilService = inject(UiUtilService);
  gameplayService: GameplayService = inject(GameplayService);
  websocketService: WebsocketService = inject(WebsocketService);
  router: Router = inject(Router);
  location: Location = inject(Location);
  serverConfig: ServerConfig = inject(ServerConfig);
  dialog: MatDialog = inject(MatDialog);

  gameBoardSubscription!: Subscription;
  gameChatSubscription!: Subscription;
  playerJoinedSubscription!: Subscription;
  playerLeftSubscription!: Subscription;

  gameType!: GameType;
  createGameResponse!: CreateGameResponse;
  joinOrHost!: JoinOrHost;
  game!: SudokuGame;

  boardUpdates: BoardUpdate[] = [];
  gameChat: GameChatMessage[] = [];
  boardUpdate!: BoardUpdate;

  isLoading!: boolean;
  currentPlayer: Player;

  @ViewChild("chat") chatViewChild!: ChatComponent;
  @ViewChild("boardUpdatesComponent") boardUpdatesViewChild!: BoardUpdatesComponent;

  constructor() {
    this.currentPlayer = this.gameStateService.getCurrentPlayer()!;
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    if (this.gameStateService.getCurrentSudokuGame()) {
      this.leaveGame();
    }
  }

  private init() {
    this.gameType = this.gameStateService.getGameType()!;

    if (this.gameType === GameType.MULTI) {
      this.joinOrHost = this.gameStateService.getJoinOrHost()!;
      const joinGameResponse: JoinGameResponse | null = this.gameStateService.getJoinGameResponse()!;
      this.game = joinGameResponse.game;
      this.startMultiplayerGame();
    }
    else {
      const gameOptions: GameOptions = this.gameStateService.getGameOptions()!;
      this.startSinglePlayerGame(gameOptions);
    }
  }

  startSinglePlayerGame(gameOptions: GameOptions) {
    const game = this.gameStateService.getCurrentSudokuGame();
    if (game) {
      this.game = game;
    }
    else {
      this.isLoading = true;
      this.gameService.fetchSudokuBoard(gameOptions)
        .subscribe({
          next: (gameBoard: GameBoard) => {
            this.isLoading = false;
            const initialBoard: number[][] = UtilService.clone2DArray(gameBoard.board);
            if (this.currentPlayer) {
              this.game = new SudokuGame(this.currentPlayer.name,
                gameOptions.boardSize,
                gameOptions.level as Level,
                1,
                1,
                GameStatus.RUNNING,
                "Single-Player-Game",
                gameOptions.playerName + "'s Game",
                initialBoard,
                gameBoard.board,
                gameBoard.solution,
                [this.currentPlayer]
              );
              this.gameStateService.saveCurrentSudokuGame(this.game);
            }
          },
          error: (error) => {
            this.uiUtilService.showSnackBar(error, "Ok", 8);
          }
        });
    }
  }

  private startMultiplayerGame() {

    this.gameBoardSubscription = this.gameplayService
      .watchBoardUpdates(this.game.gameId)
      .subscribe((boardUpdate: BoardUpdate) => {
        this.updateBoard(boardUpdate.value, boardUpdate.row, boardUpdate.column);
        this.boardUpdates.push(boardUpdate);
        if (this.boardUpdatesViewChild) {
          this.boardUpdatesViewChild.scrollToLastBoardUpdate();
        }
      });

    this.playerJoinedSubscription = this.gameplayService
      .watchPlayerJoined(this.game.gameId)
      .subscribe((joinedPlayer: Player) => {
        if (this.currentPlayer.id !== joinedPlayer.id ||
          this.currentPlayer.playerType !== joinedPlayer.playerType) {
          this.uiUtilService.showSnackBar(joinedPlayer.name + " joined the game.", "", 4);
        }
      });

    this.playerLeftSubscription = this.gameplayService
      .watchPlayerLeft(this.game.gameId)
      .subscribe((leftPlayer: Player) => {
        if (this.currentPlayer.id !== leftPlayer.id ||
          this.currentPlayer.playerType !== leftPlayer.playerType) {
          this.uiUtilService.showSnackBar(leftPlayer.name + " left the game.", "", 4);
        }
      });

    this.gameChatSubscription = this.gameplayService
      .watchGameChatMessage(this.game.gameId)
      .subscribe((gameChatMessage: GameChatMessage) => {
        this.chatViewChild.scrollToLastMessage();
        this.gameChat.push(gameChatMessage);
      });

    this.syncGameChat();
    this.syncBoardUpdates();
    this.syncJoinedPlayers();
  }

  private updateBoard(value: number, row: number, column: number) {
    this.game.currentBoard[row][column] = value;
  }

  private syncGameChat() {
    this.gameplayService.fetchGameChat(this.game.gameId)
      .subscribe({
        next: (gameChat: GameChatMessage[]) => {
          if (gameChat) {
            this.gameChat = gameChat;
            if (this.chatViewChild) {
              this.chatViewChild.scrollToLastMessage();
            }
          }
        },
        error: (error: string) => {
          this.uiUtilService.showSnackBar(error, "Ok", 8);
        }
      });
  }

  private syncBoardUpdates() {
    this.gameplayService.fetchBoardUpdates(this.game.gameId)
      .subscribe({
        next: (boardUpdates: BoardUpdate[]) => {
          if (boardUpdates) {
            this.boardUpdates = boardUpdates;
            for (let update of boardUpdates) {
              this.updateBoard(update.value, update.row, update.column);
            }
          }
        },
        error: (error: string) => {
          this.uiUtilService.showSnackBar(error, "Ok", 8);
        }
      });
  }

  private syncJoinedPlayers() {
    this.gameplayService.fetchJoinedPlayers(this.game.gameId)
      .subscribe({
        next: (joinedPlayers: Player[]) => {
          this.game.players = joinedPlayers;
          this.game.playerCount = joinedPlayers.length;
        },
        error: (err) => {
          this.uiUtilService.showSnackBar(err, "Ok", 8);
        }
      });
  }

  onBoardUpdateFromChild(boardUpdate: BoardUpdate) {
    boardUpdate.player = this.currentPlayer!;

    if (this.gameType === GameType.MULTI) {
      this.gameplayService.sendBoardUpdates(this.game.gameId, boardUpdate);
    }
    else {
      this.updateBoard(boardUpdate.value, boardUpdate.row, boardUpdate.column);
      this.boardUpdates.push(boardUpdate);
      this.gameStateService.saveCurrentSudokuGame(this.game);
    }
  }

  onPlayerMessage(message: string) {
    if (message !== null && message.length > 0) {
      const gameChatMessage: GameChatMessage = new GameChatMessage(this.currentPlayer!, message);
      if (this.gameType === GameType.MULTI) {
        this.gameplayService.sendGameChatMessage(this.game.gameId, gameChatMessage);
      }
      else {
        this.gameChat.push(gameChatMessage);
      }
    }
  }

  leaveGameButtonClick() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: "Leave game?",
        content: "Are you sure you want to leave current game?"
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.leaveGame();
        this.location.back();
      }
    });

  }

  leaveGame() {
    if (this.gameType === GameType.SINGLE) {
      this.gameStateService.removeCurrentGameSession();
    }
    else {
      this.gameService.leaveGame(this.game.gameId, this.currentPlayer!)
        .subscribe({
          next: () => {
            this.gameStateService.removeCurrentGameSession();

            this.gameBoardSubscription.unsubscribe();
            this.playerJoinedSubscription.unsubscribe();
            this.playerLeftSubscription.unsubscribe();
            this.gameChatSubscription.unsubscribe();

          },
          error: (err) => {
            this.uiUtilService.showSnackBar(err, "Ok", 8);
          }
        });
    }
  }

}