import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { WebSocketService } from './services/web-socket.service';
import { webSocketServiceFactory } from './configs/websocket-service-factory';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),
  provideAnimationsAsync(),
  provideHttpClient(),
  {
    provide: WebSocketService,
    useFactory: webSocketServiceFactory,
  }
  ]
};
