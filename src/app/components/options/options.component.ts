import { Component, OnInit, inject } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GameOptions } from '../../models/game-options.model';
import { GameType } from '../../enums/game-type';
import { Level } from '../../enums/level';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../services/game-state.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-options',
  standalone: true,
  imports: [MatSelectModule, MatInputModule, MatFormFieldModule, MatButtonModule, ReactiveFormsModule, CommonModule],
  templateUrl: './options.component.html',
  styleUrl: './options.component.css'
})
export class OptionsComponent implements OnInit {

  gameStateService = inject(GameStateService);
  authService: AuthService = inject(AuthService);
  levels!: string[];
  router: Router = inject(Router);

  ngOnInit(): void {
    this.fetchLevels();
  }

  optionsForm!: FormGroup;

  constructor() {

  }

  public submit(): void {
    let optionsFormValue = this.optionsForm.value;
    let selectedLevel!: Level;
    for (const key in Level) {
      if (Level[key as keyof typeof Level] === optionsFormValue.level) {
        selectedLevel = key as Level;
        break;
      }
    }

    const gameOptions = new GameOptions(
      optionsFormValue.playerName,
      optionsFormValue.boardSize,
      selectedLevel);

    this.gameStateService.saveGameOptions(gameOptions);
    this.gameStateService.saveGameType(GameType.SINGLE);
    this.router.navigate(['game-screen']);
  }

  protected fetchLevels(): void {
    this.levels = Object.values(Level);
    this.optionsForm = new FormGroup({
      playerName: new FormControl(this.getSavedPlayerName(), Validators.required),
      boardSize: new FormControl('9', [Validators.required, Validators.min(4), Validators.max(9)]),
      level: new FormControl(Level.EASY)
    });
  }

  getSavedPlayerName(): string {
    let player = this.gameStateService.getCurrentPlayer();
    if (player) {
      return player.name;
    }

    return '';
  }

}
