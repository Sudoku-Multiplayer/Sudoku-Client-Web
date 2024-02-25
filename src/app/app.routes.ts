import { Routes } from '@angular/router';
import { OptionsComponent } from './components/options/options.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { GameScreenComponent } from './components/game-screen/game-screen.component';

export const routes: Routes = [
    {path: '', redirectTo: "main-menu", pathMatch: "full"},
    {path: 'main-menu', component: MainMenuComponent, title: "Main Menu"},
    {path: 'options', component: OptionsComponent, title: "Options"},
    {path: 'game-screen', component: GameScreenComponent, title: "Game"},
    {path: '**', redirectTo: "main-menu", pathMatch: "full"}
];
