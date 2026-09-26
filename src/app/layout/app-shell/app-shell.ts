import { Component, HostListener, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../auth/auth.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatSidenavModule, MatIconModule, MatButtonModule, MatMenuModule],
  template: `
    <mat-sidenav-container class="shell">
      <mat-sidenav
        #drawer
        class="shell__sidenav"
        [mode]="sidenavMode()"
        [opened]="isSidenavOpen()"
        (closedStart)="isSidenavOpen.set(false)"
      >
        <a routerLink="/dashboard" class="shell__brand">
          <span class="logo-mark" aria-hidden="true">&lt;/&gt;</span>
          <span class="font-heading text-lg font-semibold text-[var(--pm-ink)]">PrepMate</span>
        </a>

        <nav class="shell__nav" aria-label="Primary">
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="shell__nav-link--active"
              class="shell__nav-link"
            >
              <mat-icon>{{ item.icon }}</mat-icon>
              {{ item.label }}
            </a>
          }
        </nav>
      </mat-sidenav>

      <mat-sidenav-content class="shell__content">
        <header class="shell__topbar">
          <button
            type="button"
            mat-icon-button
            class="lg:!hidden"
            (click)="drawer.toggle()"
            aria-label="Toggle navigation"
          >
            <mat-icon>menu</mat-icon>
          </button>

          <h1 class="font-heading text-xl font-semibold text-[var(--pm-ink)]">{{ pageTitle() }}</h1>

          <div class="flex-1"></div>

          <button
            type="button"
            class="shell__avatar-trigger"
            [matMenuTriggerFor]="userMenu"
            aria-label="Account menu"
          >
            <span class="shell__avatar">{{ userInitials() }}</span>
          </button>
          <mat-menu #userMenu="matMenu">
            <a mat-menu-item routerLink="/profile">Profile</a>
            <button mat-menu-item type="button" (click)="auth.logout()">Log out</button>
          </mat-menu>
        </header>

        <div class="shell__body">
          <ng-content />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styleUrl: './app-shell.scss',
})
export class AppShell implements OnInit {
  protected readonly auth = inject(AuthService);

  // Signal input — the only thing left as a genuine per-page override.
  readonly pageTitle = input('');

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

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: 'space_dashboard' },
    { label: 'My Interviews', path: '/my-interviews', icon: 'forum' },
    { label: 'Profile', path: '/profile', icon: 'person' },
  ];

  protected readonly isSidenavOpen = signal(true);
  protected readonly sidenavMode = signal<'side' | 'over'>('side');

  ngOnInit(): void {
    this.updateLayoutForViewport();
  }

  @HostListener('window:resize')
  protected onResize(): void {
    this.updateLayoutForViewport();
  }

  private updateLayoutForViewport(): void {
    const isDesktop = window.innerWidth >= 1024;
    this.sidenavMode.set(isDesktop ? 'side' : 'over');
    this.isSidenavOpen.set(isDesktop);
  }
}