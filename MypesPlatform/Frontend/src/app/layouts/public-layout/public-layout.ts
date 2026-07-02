import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
  ],
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
      <a routerLink="/home" class="toolbar-brand">MypesPlatform</a>
      <span class="toolbar-spacer"></span>
      <div class="toolbar-links">
        <a mat-button routerLink="/home" routerLinkActive="active-link">Inicio</a>
        <a mat-button routerLink="/mapa" routerLinkActive="active-link">Mapa</a>
        @if (!(authService.isLoggedIn$ | async)) {
          <a mat-button routerLink="/register">Registro</a>
          <a mat-raised-button routerLink="/login" color="accent">Login</a>
        } @else {
          <a mat-button routerLink="/dashboard">Dashboard</a>
          <button mat-button (click)="authService.logout()">Cerrar sesión</button>
        }
      </div>
    </mat-toolbar>
    <main class="public-content">
      <router-outlet />
    </main>
  `,
  styles: [
    `
      .app-toolbar {
        position: sticky;
        top: 0;
        z-index: 100;
        gap: 0.5rem;
      }
      .toolbar-brand {
        font-size: 1.3rem;
        font-weight: 700;
        color: #fff;
        text-decoration: none;
        letter-spacing: -0.5px;
      }
      .toolbar-spacer {
        flex: 1 1 auto;
      }
      .toolbar-links {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }
      .active-link {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 4px;
      }
      .public-content {
        min-height: calc(100vh - 64px);
      }
    `,
  ],
})
export class PublicLayoutComponent {
  constructor(public authService: AuthService) {}
}
