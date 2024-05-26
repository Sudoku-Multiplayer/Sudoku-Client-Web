import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../services/auth.service';
import { Player } from '../../models/player.model';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router, RouterModule } from '@angular/router';
import { UiUtilService } from '../../services/ui-util.service';
import { MatDividerModule } from '@angular/material/divider';
import { PlayerData } from '../../models/player-data.model';
import { LoginRequest } from '../../models/login-request.model';
import { MatIconModule } from '@angular/material/icon';
import { MatPseudoCheckbox } from '@angular/material/core';
import { PlayerType } from '../../enums/player-type';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatDividerModule,
    CommonModule,
    MatCheckboxModule,
    RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  guestForm!: FormGroup;

  authService: AuthService = inject(AuthService);
  uiUtilService: UiUtilService = inject(UiUtilService);
  gameStateService: GameStateService = inject(GameStateService);
  router: Router = inject(Router);

  hidePassword: boolean = true;

  constructor() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['main-menu']);
    }
  }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
      rememberMe: new FormControl(false),
    });

    this.guestForm = new FormGroup({
      guestName: new FormControl('Guest', Validators.required)
    });
  }

  login() {
    const loginFormValue = this.loginForm.value;

    const email = loginFormValue.email;
    const password = loginFormValue.password;

    const loginRequest: LoginRequest = new LoginRequest(email, password);

    this.authService.login(loginRequest)
      .subscribe({
        next: (player: Player) => {
          if (loginFormValue.rememberMe) {
            this.gameStateService.savePlayer(player, true);
          }
          else {
            this.gameStateService.savePlayer(player, false);
          }

          this.router.navigate(['main-menu']);
        },

        error: (err) => {
          this.uiUtilService.showSnackBar(err, "Ok", 8);
        }
      });

  }

  guestLogin() {
    const guestFormValue = this.guestForm.value;

    const guestName = guestFormValue.guestName;

    this.authService.loginGuestPlayer(guestName)
      .subscribe({
        next: (guestPlayer: Player) => {
          this.gameStateService.savePlayer(guestPlayer, false);
          this.router.navigate(['main-menu']);
        },
        error: (error) => {
          this.uiUtilService.showSnackBar(error, "Ok", 8);
        }
      });
  }

  about() {
    this.uiUtilService.showAboutDialog();
  }

}
