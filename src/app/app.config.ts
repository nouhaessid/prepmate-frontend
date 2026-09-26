import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideAppInitializer } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideKeycloak } from 'keycloak-angular';
import { initializeKeycloak } from './auth/keycloak-init';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), 
    provideClientHydration(),
    provideKeycloak({
      config: {
        url: 'http://localhost:9098',
        realm: 'prepmate',
        clientId: 'prepmate-app'
      }
    }),
    provideAppInitializer(initializeKeycloak)
  ]
};
