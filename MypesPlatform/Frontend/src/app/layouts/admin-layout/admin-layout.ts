import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  template: `
    <mat-sidenav-container class="admin-container">
      <mat-sidenav
        #sidenav
        mode="side"
        opened
        class="admin-sidenav"
        [class.sidenav-collapsed]="collapsed()"
      >
        <div class="sidenav-header">
          @if (!collapsed()) {
            <a routerLink="/dashboard" class="sidenav-brand">MypesPlatform</a>
          } @else {
            <a routerLink="/dashboard" class="sidenav-brand-short">MP</a>
          }
          <button mat-icon-button (click)="collapsed.set(!collapsed())">
            <mat-icon>{{ collapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          </button>
        </div>

        <mat-nav-list>
          @for (item of navItems; track item.route) {
            <a
              mat-list-item
              [routerLink]="item.route"
              routerLinkActive="active-nav-item"
              [matTooltip]="collapsed() ? item.label : ''"
            >
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              @if (!collapsed()) {
                <span matListItemTitle>{{ item.label }}</span>
              }
            </a>
          }
        </mat-nav-list>

        <div class="sidenav-footer">
          <button mat-button (click)="authService.logout()" class="logout-btn">
            <mat-icon>logout</mat-icon>
            @if (!collapsed()) {
              <span>Cerrar sesión</span>
            }
          </button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="admin-content">
        <mat-toolbar class="admin-toolbar">
          <button mat-icon-button (click)="sidenav.toggle()" class="menu-toggle">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-spacer"></span>
          <span class="toolbar-user">
            <mat-icon>account_circle</mat-icon>
            {{ authService.getUsername() || 'Admin' }}
          </span>
        </mat-toolbar>

        <main class="admin-page">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .admin-container {
        height: 100vh;
      }
      .admin-sidenav {
        width: 240px;
        background: #1e293b;
        border: none;
        display: flex;
        flex-direction: column;
        transition: width 0.2s ease;
        overflow: hidden;
      }
      .sidenav-collapsed {
        width: 64px !important;
      }
      .sidenav-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 0.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        min-height: 56px;
      }
      .sidenav-brand,
      .sidenav-brand-short {
        color: #fff;
        text-decoration: none;
        font-weight: 700;
      }
      .sidenav-brand {
        font-size: 1.1rem;
        letter-spacing: -0.5px;
      }
      .sidenav-brand-short {
        font-size: 1rem;
        padding: 0 0.5rem;
      }
      .sidenav-header button {
        color: rgba(255, 255, 255, 0.6);
      }
      .mat-mdc-nav-list {
        flex: 1;
        padding-top: 0.5rem;
      }
      .mdc-list-item {
        color: rgba(255, 255, 255, 0.7) !important;
        border-radius: 8px !important;
        margin: 2px 8px;
      }
      .active-nav-item {
        background: rgba(255, 255, 255, 0.1) !important;
        color: #fff !important;
      }
      .mdc-list-item:hover {
        background: rgba(255, 255, 255, 0.06) !important;
      }
      .sidenav-footer {
        padding: 0.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }
      .logout-btn {
        color: rgba(255, 255, 255, 0.6) !important;
        width: 100%;
        display: flex;
        justify-content: flex-start;
        gap: 0.5rem;
      }
      .admin-content {
        background: #f5f7fa;
      }
      .admin-toolbar {
        background: #fff;
        border-bottom: 1px solid #e0e0e0;
        position: sticky;
        top: 0;
        z-index: 50;
      }
      .toolbar-spacer {
        flex: 1 1 auto;
      }
      .toolbar-user {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.9rem;
        color: #555;
      }
      .admin-page {
        padding: 1.5rem;
        min-height: calc(100vh - 64px);
      }
      @media (max-width: 768px) {
        .admin-sidenav {
          width: 64px;
        }
        .admin-page {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class AdminLayoutComponent {
  collapsed = signal(false);

  navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'store', label: 'Tiendas', route: '/tiendas' },
    { icon: 'inventory_2', label: 'Productos', route: '/productos' },
    { icon: 'map', label: 'Mapa', route: '/mapa' },
    { icon: 'settings', label: 'Configuración', route: '/configuracion' },
    { icon: 'person', label: 'Perfil', route: '/perfil' },
  ];

  constructor(public authService: AuthService) {}
}
