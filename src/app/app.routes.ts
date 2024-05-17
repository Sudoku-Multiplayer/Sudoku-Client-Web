import { Routes } from '@angular/router';
import { OptionsComponent } from './components/options/options.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { GameScreenComponent } from './components/game-screen/game-screen.component';
import { MultiplayerScreenComponent } from './components/multiplayer-screen/multiplayer-screen.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { authGuard } from './guards/auth.guard';
import { gameScreenGuard } from './guards/game-screen.guard';

export const routes: Routes = [
    { path: '', redirectTo: "main-menu", pathMatch: "full" },
    { path: 'main-menu', component: MainMenuComponent, title: "Main Menu", canActivate: [authGuard] },
    { path: 'login', component: LoginComponent, title: "Login" },
    { path: 'signup', component: SignupComponent, title: "Signup" },
    { path: 'options', component: OptionsComponent, title: "Options" },
    { path: 'settings', component: SettingsComponent, title: "Settings" },
    { path: 'multiplayer-screen', component: MultiplayerScreenComponent, title: "Multiplayer" },
    { path: 'game-screen', component: GameScreenComponent, title: "Game", canActivate: [gameScreenGuard] },
    { path: '**', redirectTo: "main-menu", pathMatch: "full" }
];
