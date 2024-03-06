import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { GameStateService } from '../services/game-state.service';

export const gameScreenGuard: CanActivateFn = (route, state) => {
  
  let gameStateService: GameStateService = inject(GameStateService);
  let router: Router = inject(Router);

  if(!gameStateService.hasGameOptions()){
    router.navigate(['main-menu']);
    return false;
  }

  return true;
};
