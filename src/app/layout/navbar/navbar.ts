import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../auth/auth.service';

interface NavLink {
  label: string;
  fragment: string;
}


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule, MatMenuModule],
  template: `
    <header class="navbar" [class.navbar--scrolled]="isScrolled()">
      <div class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        <!-- Logo -->
        <a href="#top" class="flex items-center gap-2 shrink-0" (click)="closeMobileMenu()">
          <span class="logo-mark" aria-hidden="true">&lt;/&gt;</span>
          <span class="text-lg font-semibold tracking-tight text-[var(--pm-ink)] font-heading">
            PrepMate
          </span>
        </a>

        <!-- Desktop navigation -->
        <nav class="hidden md:flex items-center gap-8" aria-label="Primary">
          @for (link of navLinks; track link.fragment) {
            <a [href]="'#' + link.fragment" class="nav-link">
              {{ link.label }}
            </a>
          }
        </nav>

        <!-- Desktop actions -->
        <div class="hidden md:flex items-center gap-3">
          @if (auth.isAuthenticated()) {
            <a routerLink="/dashboard" mat-flat-button class="pm-button-primary !rounded-full !px-5">
              Dashboard
            </a>
            <button
              type="button"
              class="navbar-avatar-trigger"
              [matMenuTriggerFor]="userMenu"
              aria-label="Account menu"
            >
              <span class="navbar-avatar">{{ userInitials() }}</span>
            </button>
            <mat-menu #userMenu="matMenu">
              <a mat-menu-item routerLink="/profile">Profile</a>
              <button mat-menu-item type="button" (click)="auth.logout()">Log out</button>
            </mat-menu>
          } @else {
            <button type="button" class="nav-link nav-button" (click)="auth.login('/dashboard')">Log in</button>
            <button type="button" mat-flat-button class="pm-button-primary !rounded-full !px-5" (click)="auth.register('/dashboard')">
              Get started
            </button>
          }
        </div>
        
        <!-- Mobile menu -->
        <button
          type="button"
          class="md:hidden inline-flex items-center justify-center rounded-md p-2 text-[var(--pm-ink)] cursor-pointer"
          (click)="toggleMobileMenu()"
          [attr.aria-expanded]="isMobileMenuOpen()"
          aria-label="Toggle navigation menu"
        >
          <mat-icon>{{ isMobileMenuOpen() ? 'close' : 'menu' }}</mat-icon>
        </button>
      </div>

      @if (isMobileMenuOpen()) {
        <nav class="mobile-panel md:hidden" aria-label="Mobile">
          <div class="flex flex-col gap-1 px-4 pb-4 pt-2">
            @for (link of navLinks; track link.fragment) {
              <a
                [href]="'#' + link.fragment"
                class="mobile-link"
                (click)="closeMobileMenu()"
              >
                {{ link.label }}
              </a>
            }

            <div class="mt-3 flex flex-col gap-2">
              @if (auth.isAuthenticated()) {
                <a
                  routerLink="/dashboard"
                  mat-flat-button
                  class="pm-button-primary !rounded-full w-full text-center"
                  (click)="closeMobileMenu()"
                >
                  Dashboard
                </a>
                <button
                  type="button"
                  mat-stroked-button
                  class="pm-button-secondary !rounded-full w-full text-center"
                  (click)="auth.logout(); closeMobileMenu()"
                >
                  Log out
                </button>
              } @else {
                <button type="button" class="mobile-link nav-button" (click)="auth.login('/dashboard'); closeMobileMenu()">
                  Log in
                </button>
                <button
                  type="button"
                  mat-flat-button
                  class="pm-button-primary !rounded-full w-full text-center"
                  (click)="auth.register('/dashboard'); closeMobileMenu()"
                >
                  Get started
                </button>
              }
            </div>
          </div>
        </nav>
      }
    </header>
  `,
  styleUrl: './navbar.scss',
})
export class Navbar {
  protected readonly auth = inject(AuthService);
  protected readonly isScrolled = signal(false);
  protected readonly isMobileMenuOpen = signal(false);

  protected readonly navLinks: NavLink[] = [
    { label: 'Product', fragment: 'features' },
    { label: 'How it works', fragment: 'how-it-works' },
  ];

  protected userInitials(): string {
    const name = this.auth.getUserName() || this.auth.getUserEmail();
    const initials = name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .slice(0, 2);
    return initials || '?';
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 8);
  }

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((open) => !open);
  }

  protected closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}