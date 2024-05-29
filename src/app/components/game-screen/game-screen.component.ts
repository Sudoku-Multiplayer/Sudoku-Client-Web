import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
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
import { Level } from '../../enums/level';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../ui/confirmation-dialog/confirmation-dialog.component';
import { WebSocketService } from '../../services/web-socket.service';
import { GameSession } from '../../models/game-session.model';
import { GameSessionStatus } from '../../enums/game-session-status';
import { JoinStatus } from '../../enums/join-status';
import { VoteStatus } from '../../enums/vote-status';
import { VoteRecord } from '../../models/vote-record.model';
import { MatIconModule } from '@angular/material/icon';
import { GameScreenSettingsComponent } from '../game-screen-settings/game-screen-settings.component';
import { GameScreenSettings } from '../../models/game-screen-settings.model';

@Component({
  selector: 'app-game-screen',
  standalone: true,
  templateUrl: './game-screen.component.html',
  styleUrl: './game-screen.component.css',
  imports: [
    MainMenuComponent,
    OptionsComponent,
    GameBoardComponent,
    ChatComponent,
    BoardUpdatesComponent,
    MatProgressSpinnerModule,
    MatButtonModule,
    CommonModule,
    MatIconModule
  ]
})
export class GameScreenComponent implements OnInit, OnDestroy {

  gameService: GameService = inject(GameService);
  gameStateService: GameStateService = inject(GameStateService);
  authService: AuthService = inject(AuthService);
  uiUtilService: UiUtilService = inject(UiUtilService);
  gameplayService: GameplayService = inject(GameplayService);
  websocketService: WebSocketService = inject(WebSocketService);
  router: Router = inject(Router);
  location: Location = inject(Location);
  serverConfig: ServerConfig = inject(ServerConfig);
  dialog: MatDialog = inject(MatDialog);

  gameBoardSubscription!: Subscription;
  gameChatSubscription!: Subscription;
  playerJoinedSubscription!: Subscription;
  playerLeftSubscription!: Subscription;
  timeUpdateSubscription!: Subscription;
  gameSessionStatusUpdateSubscription!: Subscription;
  gameSessionMessageUpdateSubscription!: Subscription;
  gameSubmissionVoteInitiatedSubscription!: Subscription;
  gameSubmissionVoteCastedSubscription!: Subscription;

  gameType!: GameType;
  createGameResponse!: CreateGameResponse;
  joinOrHost!: JoinOrHost;
  game!: SudokuGame;
  gameSession!: GameSession;
  gameScreenSettings!: GameScreenSettings;

  boardUpdates: BoardUpdate[] = [];
  gameChat: GameChatMessage[] = [];
  boardUpdate!: BoardUpdate;
  timeRemainingMin: number = 0;
  timeRemainingSec: number = 0;
  gameSessionStatusType: typeof GameSessionStatus = GameSessionStatus;
  gameScreenMessage: string = "";
  showSolution: boolean = false;

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

    if (this.gameStateService.canEnterGameScreenForSingleplayer() ||
      this.gameStateService.canEnterGameScreenForMultiplayer()
    ) {
      this.leaveGame();
    }

  }

  private init() {
    this.gameScreenSettings = this.gameStateService.getGameScreenSettings();
    this.gameType = this.gameStateService.getGameType()!;

    if (this.gameType === GameType.MULTI) {
      this.isLoading = true;

      this.gameService.joinGame(this.gameStateService.getJoinGameId()!, this.gameStateService.getCurrentPlayer()!)
        .subscribe({
          next: (joinGameResponse: JoinGameResponse) => {
            const gameJoinStatus = JoinStatus[joinGameResponse.joinStatus as unknown as keyof typeof JoinStatus];

            if (gameJoinStatus === JoinStatus.PLAYER_ADDED || gameJoinStatus === JoinStatus.PLAYER_ALREADY_JOINED) {
              this.gameSession = joinGameResponse.gameSession;
              this.game = this.gameSession.game;
              this.timeRemainingMin = Math.floor(this.gameSession.remainingTime / 60);
              this.timeRemainingSec = this.gameSession.remainingTime % 60;
              this.isLoading = false;

              const gameSessionStatus = GameSessionStatus[this.gameSession.gameSessionStatus as unknown as keyof typeof GameSessionStatus];
              this.setGameScreenMessage(gameSessionStatus);
              if (gameSessionStatus === GameSessionStatus.FINISHED) {
                this.showSolution = true;
              }
              this.startMultiplayerGame();
            }
            else if (gameJoinStatus === JoinStatus.GAME_FULL) {
              this.gameStateService.removeCurrentGameSession();
              this.location.back();
              this.uiUtilService.showSnackBar("Game is Full, cannot join", "Ok", 10);
            }
          },
          error: (error) => {
            this.uiUtilService.showSnackBar(error, "Ok", 10);
          }
        });
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
              this.game = new SudokuGame(this.currentPlayer,
                gameOptions.boardSize,
                gameOptions.level as Level,
                1,
                1,
                GameSessionStatus.RUNNING,
                "Single-Player-Game",
                gameOptions.playerName + "'s Game",
                initialBoard,
                gameBoard.board,
                gameBoard.solution,
                [this.currentPlayer],
                5 * 60,
                5 * 60
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
        if (this.gameScreenSettings.autoScrollBoardUpdates) {
          if (this.boardUpdatesViewChild) {
            this.boardUpdatesViewChild.scrollToLastBoardUpdate();
          }
        }
      });

    this.gameSessionStatusUpdateSubscription = this.gameplayService
      .watchGameSessionStatusUpdate(this.game.gameId)
      .subscribe((updatedGameSessionStatus: GameSessionStatus) => {
        this.gameSession.gameSessionStatus = GameSessionStatus[updatedGameSessionStatus as unknown as keyof typeof GameSessionStatus];
        this.setGameScreenMessage(updatedGameSessionStatus);
        if (updatedGameSessionStatus === GameSessionStatus.FINISHED) {
          this.showSolution = true;
        }
      });

    this.gameSessionMessageUpdateSubscription = this.gameplayService
      .watchGameSessionMessageUpdate(this.game.gameId)
      .subscribe((message: string) => {
        this.uiUtilService.showSnackBar(message, "Ok", 5);
      });

    this.playerJoinedSubscription = this.gameplayService
      .watchPlayerJoined(this.game.gameId)
      .subscribe((joinedPlayer: Player) => {
        if (this.currentPlayer.id !== joinedPlayer.id ||
          this.currentPlayer.playerType !== joinedPlayer.playerType) {
          this.gameSession.players.push(joinedPlayer);
          this.uiUtilService.showSnackBar(joinedPlayer.name + " joined the game.", "", 4);
        }
      });

    this.playerLeftSubscription = this.gameplayService
      .watchPlayerLeft(this.game.gameId)
      .subscribe((leftPlayer: Player) => {

        if (this.currentPlayer.id !== leftPlayer.id ||
          this.currentPlayer.playerType !== leftPlayer.playerType) {

          const tempPlayers: Player[] = [];
          this.gameSession.players.forEach(player => {
            if (player.id != leftPlayer.id || player.playerType != leftPlayer.playerType) {
              tempPlayers.push(player);
            }
          });
          this.gameSession.players = tempPlayers;
          this.uiUtilService.showSnackBar(leftPlayer.name + " left the game.", "", 4);
        }
      });

    this.gameChatSubscription = this.gameplayService
      .watchGameChatMessage(this.game.gameId)
      .subscribe((gameChatMessage: GameChatMessage) => {
        if (this.gameScreenSettings.autoScrollGameChat) {
          this.chatViewChild.scrollToLastMessage();
        }
        this.gameChat.push(gameChatMessage);
      });

    this.timeUpdateSubscription = this.gameplayService
      .watchTimeUpdate(this.game.gameId)
      .subscribe((updatedTime: number) => {
        this.timeRemainingMin = Math.floor(updatedTime / 60);
        this.timeRemainingSec = updatedTime % 60;
      });


    this.gameSubmissionVoteInitiatedSubscription = this.gameplayService
      .watchGameSubmissionVoteInitiated(this.game.gameId)
      .subscribe((voteInitiator: Player) => {
        if (voteInitiator) {
          this.openCastVoteDialog(voteInitiator);
        }
      });

    this.gameSubmissionVoteCastedSubscription = this.gameplayService
      .watchGameSubmissionVoteCasted(this.game.gameId)
      .subscribe((voteRecord: VoteRecord) => {
        const voteStatus: VoteStatus = VoteStatus[voteRecord.voteStatus as unknown as keyof typeof VoteStatus];
        if (voteStatus === VoteStatus.ACCEPTED) {

        }
        else if (voteStatus === VoteStatus.REJECTED) {

        }
      });

    this.syncGameChat();
    this.syncBoardUpdates();
    this.syncJoinedPlayers();
  }

  private updateBoard(value: number, row: number, column: number) {
    this.gameSession.gameBoard[row][column] = value;
  }

  openCastVoteDialog(voteInitiator: Player): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: "Vote Submit game?",
        content: "This will end the game, lock the board, and show the final result." +
          "<br>-vote initiated by: " + voteInitiator.name
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      let voteStatus: VoteStatus;
      if (result) {
        voteStatus = VoteStatus.ACCEPTED;
      }
      else {
        voteStatus = VoteStatus.REJECTED;
      }

      const voteRecord: VoteRecord = new VoteRecord(this.currentPlayer, voteStatus);
      this.gameplayService.sendGameSubmitVote(this.game.gameId, voteRecord);
    });
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


  startGame() {
    this.gameplayService.startGame(this.game.gameId)
      .subscribe({
        next: () => {
        },
        error: (err) => {
          this.uiUtilService.showSnackBar(err, "Ok", 8);
        }
      });
  }

  stopGame() {
    this.gameplayService.stopGame(this.game.gameId)
      .subscribe({
        next: () => {
        },
        error: (err) => {
          this.uiUtilService.showSnackBar(err, "Ok", 8);
        }
      });
  }

  pauseGame() {
    this.gameplayService.pauseGame(this.game.gameId)
      .subscribe({
        next: () => {
        },
        error: (err) => {
          this.uiUtilService.showSnackBar(err, "Ok", 8);
        }
      });
  }

  resumeGame() {
    this.gameplayService.resumeGame(this.game.gameId)
      .subscribe({
        next: () => {
        },
        error: (err) => {
          this.uiUtilService.showSnackBar(err, "Ok", 8);
        }
      });
  }

  submitGame() {
    this.gameplayService.initiateGameSubmitVoting(this.game.gameId, this.currentPlayer)
      .subscribe({
        next: (voteInitiated: boolean) => {

        },
        error: (err) => {
          this.uiUtilService.showSnackBar(err, "Ok", 8);
        }
      });
  }


  leaveGame() {
    this.gameStateService.removeCurrentGameSession();

    if (this.gameType === GameType.MULTI) {
      this.gameStateService.removeCurrentGameSession();
      this.gameService.leaveGame(this.game.gameId, this.currentPlayer!)
        .subscribe({
          next: () => {
            this.gameBoardSubscription.unsubscribe();
            this.playerJoinedSubscription.unsubscribe();
            this.playerLeftSubscription.unsubscribe();
            this.gameChatSubscription.unsubscribe();
            this.timeUpdateSubscription.unsubscribe();
            this.gameSessionStatusUpdateSubscription.unsubscribe();
            this.gameSessionMessageUpdateSubscription.unsubscribe();
            this.gameSubmissionVoteInitiatedSubscription.unsubscribe();
            this.gameSubmissionVoteCastedSubscription.unsubscribe();
          },
          error: (err) => {
            this.uiUtilService.showSnackBar(err, "Ok", 8);
          }
        });
    }
  }

  openGameScreenSettingsDialog() {
    const dialogRef = this.dialog.open(GameScreenSettingsComponent);

    dialogRef.componentInstance.settingsSubmited.subscribe(gameScreenSettings => {
      if (gameScreenSettings) {
        this.gameScreenSettings = gameScreenSettings;
      }
      dialogRef.close();
    });
  }

  isHostPlayer(player: Player): boolean {
    const hostPlayer: Player = this.game.hostPlayer;
    if (player.id === hostPlayer.id &&
      player.playerType === hostPlayer.playerType
    ) {
      return true;
    }

    return false;
  }

  isCurrentPlayer(player: Player): boolean {
    if (player.id === this.currentPlayer.id &&
      player.playerType === this.currentPlayer.playerType
    ) {
      return true;
    }

    return false;
  }

  isGameSessionStatus(gameSessionStatus: GameSessionStatus): boolean {
    const current = GameSessionStatus[this.gameSession.gameSessionStatus as unknown as keyof typeof GameSessionStatus];

    if (current === gameSessionStatus) {
      return true;
    }

    return false;
  }

  isMultiplayerGame(): boolean {
    if (this.gameType === GameType.MULTI) {
      return true;
    }

    return false;
  }

  private setGameScreenMessage(gameSessionStatus: GameSessionStatus) {
    if (gameSessionStatus === GameSessionStatus.NEW) {
      this.gameScreenMessage = "Game has not started yet.<br> Waiting for host to start the game."
    }
    else if (gameSessionStatus === GameSessionStatus.PAUSED) {
      this.gameScreenMessage = "Game Paused."
    }
    else if (gameSessionStatus === GameSessionStatus.FINISHED) {
      this.gameScreenMessage = "Game Over!"
    }
  }

}
