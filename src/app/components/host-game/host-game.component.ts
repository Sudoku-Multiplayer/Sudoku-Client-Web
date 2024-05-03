import { Component, OnInit, inject } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Level } from '../../enums/level';
import { CommonModule } from '@angular/common';
import { CreateGameRequest } from '../../models/create-game-request.model';
import { Player } from '../../models/player.model';
import { GameService } from '../../services/game.service';
import { UiUtilService } from '../../services/ui-util.service';
import { HttpClient } from '@angular/common/http';
import { CreateGameResponse } from '../../interfaces/create-game-response';
import { Router } from '@angular/router';
import { GameType } from '../../enums/game-type';
import { GameStateService } from '../../services/game-state.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-host-game',
  standalone: true,
  imports: [MatSelectModule, MatInputModule, MatFormFieldModule, MatButtonModule, ReactiveFormsModule, CommonModule],
  templateUrl: './host-game.component.html',
  styleUrl: './host-game.component.css'
})
export class HostGameComponent implements OnInit {

  gameService: GameService = inject(GameService);
  gameStateService: GameStateService = inject(GameStateService);
  authService: AuthService = inject(AuthService);
  uiUtilService: UiUtilService = inject(UiUtilService);
  httpClient: HttpClient = inject(HttpClient);
  router: Router = inject(Router);

  currentPlayer: Player = this.gameStateService.getCurrentPlayer()!;

  ngOnInit(): void {
    this.fetchLevels();
  }

  levels!: string[];

  hostGameForm!: FormGroup;

  submit() {
    let formValue = this.hostGameForm.value;

    let level!: Level;
    for (const key in Level) {
      if (Level[key as keyof typeof Level] === formValue.level) {
        level = key as Level;
        break;
      }
    }

    if (this.currentPlayer) {
      const createGameRequest: CreateGameRequest = new CreateGameRequest(this.currentPlayer,
        formValue.gameName,
        formValue.boardSize,
        level,
        formValue.playerLimit,
        formValue.timeLimit * 60
      );
      this.gameService.hostGame(createGameRequest)
        .subscribe({
          next: (createGameResponse: CreateGameResponse) => {
            this.gameStateService.saveJoinGameId(createGameResponse.gameId);
            this.gameStateService.saveGameType(GameType.MULTI);
            this.router.navigate(['game-screen']);
          },
          error: (error) => {
            this.uiUtilService.showSnackBar(error, "Ok", 10);
          }
        });
    }
  }

  protected fetchLevels(): void {
    this.levels = Object.values(Level);

    this.hostGameForm = new FormGroup({
      gameName: new FormControl(this.getDefaultGameName(), Validators.required),
      boardSize: new FormControl('9', [Validators.required, Validators.min(4), Validators.max(9)]),
      level: new FormControl(Level.EASY),
      playerLimit: new FormControl('5', [Validators.required, Validators.min(2), Validators.max(5)]),
      timeLimit: new FormControl('5', [Validators.required, Validators.min(1), Validators.max(10)])
    });
  }

  getDefaultGameName(): string {
    return this.gameStateService.getCurrentPlayer()!.name + "'s game";
  }

}
