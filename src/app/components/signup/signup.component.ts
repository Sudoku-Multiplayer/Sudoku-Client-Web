import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { confirmPasswordValidator } from '../../validators/confirm-password.validator';
import { PlayerData } from '../../models/player-data.model';
import { AuthService } from '../../services/auth.service';
import { Player } from '../../models/player.model';
import { UiUtilService } from '../../services/ui-util.service';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [MatInputModule, MatButtonModule, ReactiveFormsModule, MatDividerModule, CommonModule, RouterModule, MatIconModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent implements OnInit {

  signupForm!: FormGroup;
  passwordHide: boolean = true;
  confirmPasswordHide: boolean = true;

  authService: AuthService = inject(AuthService);
  gameStateService: GameStateService = inject(GameStateService);
  uiUtilService: UiUtilService = inject(UiUtilService);
  router: Router = inject(Router);

  MIN_PASSWORD_LENGTH: number = 6;

  ngOnInit(): void {
    this.signupForm = new FormGroup({
      playerName: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(this.MIN_PASSWORD_LENGTH)]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
      { validators: confirmPasswordValidator }
    );
  }

  signup() {

    const signupFormValue = this.signupForm.value;

    const playerData: PlayerData = new PlayerData(
      undefined,
      signupFormValue.playerName,
      signupFormValue.email,
      signupFormValue.password,
      undefined,
      undefined
    );

    this.authService.signup(playerData)
      .subscribe({
        next: (player: Player) => {
          this.gameStateService.savePlayer(player, true);
          this.router.navigate(['main-menu']);
        },
        error: (err) => {
          this.uiUtilService.showSnackBar(err, "ok", 8);
        }
      });
  }

}
