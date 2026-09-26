import { Injectable, inject } from '@angular/core';
import Keycloak from 'keycloak-js';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private keycloak = inject(Keycloak);

  register(redirectUri?: string): void {
    this.keycloak.register({
      redirectUri: redirectUri ? `${window.location.origin}${redirectUri}` : window.location.origin
    });
  }

  login(redirectUri?: string): void {
    this.keycloak.login({
      redirectUri: redirectUri ? `${window.location.origin}${redirectUri}` : window.location.origin
    });
  }

  logout(): void {
    this.keycloak.logout({
      redirectUri: window.location.origin
    });
  }

  isAuthenticated(): boolean {
    return this.keycloak.authenticated ?? false;
  }

  getToken(): string | undefined {
    return this.keycloak.token;
  }

  getUserName(): string {
    return this.keycloak.tokenParsed?.['name'] ?? '';
  }

  getUserEmail(): string {
    return this.keycloak.tokenParsed?.['email'] ?? '';
  }

  getKeycloakUserId(): string {
    return this.keycloak.tokenParsed?.['sub'] ?? '';
  }

}