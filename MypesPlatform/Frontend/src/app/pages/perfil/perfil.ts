import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { RoleNamePipe } from '../../shared/pipes/role-name.pipe';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    RoleNamePipe,
  ],
  template: `
    <div class="perfil-page">
      <h1 class="page-title">Perfil</h1>
      <p class="page-subtitle">Información de tu cuenta</p>

      <mat-card class="perfil-card" appearance="outlined">
        <mat-card-header>
          <div class="avatar">
            <mat-icon class="avatar-icon">person</mat-icon>
          </div>
          <div class="avatar-info">
            <mat-card-title>{{ username }}</mat-card-title>
            <mat-card-subtitle>
              <span class="role-badge" [class.admin]="isAdmin">
                {{ role | roleName }}
              </span>
            </mat-card-subtitle>
          </div>
        </mat-card-header>
        <mat-divider></mat-divider>
        <mat-card-content>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Usuario</span>
              <span class="info-value">{{ username }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Rol</span>
              <span class="info-value">{{ role | roleName }}</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .perfil-page { max-width: 600px; }
      .page-title { margin: 0; font-size: 1.6rem; font-weight: 600; }
      .page-subtitle { margin: 0.25rem 0 1.5rem; color: #666; }
      .perfil-card { border-radius: 16px; padding: 0.5rem; }
      mat-card-header { gap: 1rem; }
      .avatar {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: #e3f2fd;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .avatar-icon { font-size: 2rem; width: 2rem; height: 2rem; color: #1565c0; }
      .avatar-info { display: flex; flex-direction: column; justify-content: center; }
      .role-badge {
        display: inline-block;
        padding: 0.15rem 0.6rem;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 500;
        background: #f5f5f5;
        color: #666;
      }
      .role-badge.admin { background: #e3f2fd; color: #1565c0; }
      .info-grid { display: grid; gap: 1.25rem; margin-top: 1rem; }
      .info-item { display: flex; flex-direction: column; gap: 0.2rem; }
      .info-label { font-size: 0.8rem; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
      .info-value { font-size: 1rem; font-weight: 500; }
    `,
  ],
})
export class PerfilComponent implements OnInit {
  username = '';
  role = '';
  isAdmin = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername() || 'Usuario';
    this.role = this.authService.getRole() || 'CLIENTE';
    this.isAdmin = this.authService.isAdmin();
  }
}
