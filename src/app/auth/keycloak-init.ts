import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Keycloak from 'keycloak-js';
import { UserApiService } from '../api/user-api.service';

export async function initializeKeycloak() {
  const platformId = inject(PLATFORM_ID);
  const keycloak = inject(Keycloak);
  const userApi = inject(UserApiService);
  
  if (!isPlatformBrowser(platformId)) {
    return;
  }

  const authenticated = await keycloak.init({
    onLoad: 'check-sso',
    checkLoginIframe: false
  });

  if (authenticated) {
    userApi.createUserIfNotExists().subscribe({
      error: (error) => {
        console.error('Could not initialize user:', error);
      }
    });
  }
}