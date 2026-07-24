import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-gate',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="gate-container">
      <div class="gate-bg-grid"></div>
      <div class="gate-bg-glow"></div>
      
      <div class="gate-card">
        <div class="brand-badge">MYPES Platform</div>
        <h1 class="gate-title">¿Cómo querés buscar hoy?</h1>
        <p class="gate-subtitle">Encontrá stock físico en tiendas locales cerca tuyo. Sin intermediarios, directo al comercio de tu barrio.</p>

        <div class="gate-actions">
          <!-- Opción Principal: Búsqueda por Voz -->
          <a routerLink="/buscar" class="action-btn primary-voice">
            <div class="icon-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v1a7 7 0 0 1-14 0v-1"></path>
                <line x1="12" x2="12" y1="19" y2="22"></line>
              </svg>
            </div>
            <div class="action-text">
              <span class="badge-core">ACCESO DIRECTO</span>
              <h2>Búsqueda por Voz</h2>
              <p>Decí qué producto buscás y te mostramos las tiendas cercanas con stock.</p>
            </div>
            <span class="arrow-icon">→</span>
          </a>

          <!-- Opción Secundaria: Catálogo -->
          <a routerLink="/tiendas" class="action-btn secondary-catalog">
            <div class="icon-square">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect width="7" height="9" x="3" y="3" rx="1"></rect>
                <rect width="7" height="5" x="14" y="3" rx="1"></rect>
                <rect width="7" height="9" x="14" y="12" rx="1"></rect>
                <rect width="7" height="5" x="3" y="16" rx="1"></rect>
              </svg>
            </div>
            <div class="action-text">
              <h2>Explorar Catálogo</h2>
              <p>Navegación manual de tiendas, productos y mapa interactivo.</p>
            </div>
            <span class="arrow-icon">→</span>
          </a>
        </div>

        <div class="gate-footer">
          <p>Podés cambiar de modo de búsqueda en cualquier momento desde el menú superior.</p>
          <div class="footer-links">
            <a routerLink="/login" class="link-item">Iniciar Sesión</a>
            <span class="divider">•</span>
            <a routerLink="/register" class="link-item">Registrar MYPE</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gate-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--bg-primary, #faf9f6);
      position: relative;
      overflow: hidden;
      padding: 2rem;
    }
    
    .gate-bg-grid {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        linear-gradient(to right, rgba(24, 24, 27, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(24, 24, 27, 0.03) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
      z-index: 1;
    }

    .gate-bg-glow {
      position: absolute;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(79, 70, 229, 0.06) 0%, rgba(250, 249, 246, 0) 70%);
      top: -100px;
      right: -100px;
      pointer-events: none;
      z-index: 1;
    }
    
    .gate-card {
      max-width: 640px;
      width: 100%;
      background: var(--bg-blanco, #ffffff);
      border: 1px solid var(--color-borde, #e4e4e7);
      border-radius: var(--radius-lg, 18px);
      padding: 4rem 3rem;
      box-shadow: var(--shadow-subtle);
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
    }
    
    .brand-badge {
      align-self: flex-start;
      font-family: var(--font-display);
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--color-accion, #4f46e5);
      background: rgba(79, 70, 229, 0.07);
      padding: 0.4rem 0.9rem;
      border-radius: var(--radius-sm, 6px);
      margin-bottom: 2rem;
    }
    
    .gate-title {
      font-family: var(--font-display);
      font-size: 2.6rem;
      font-weight: 800;
      color: var(--texto-principal, #18181b);
      margin: 0 0 1rem 0;
      letter-spacing: -0.04em;
      line-height: 1.15;
    }
    
    .gate-subtitle {
      font-size: 1.05rem;
      color: var(--texto-secundario, #52525b);
      margin: 0 0 3rem 0;
      line-height: 1.6;
    }
    
    .gate-actions {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-bottom: 3rem;
    }
    
    .action-btn {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.75rem;
      border-radius: var(--radius-md, 12px);
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      border: 1px solid var(--color-borde, #e4e4e7);
      position: relative;
      overflow: hidden;
    }
    
    .primary-voice {
      background: var(--texto-principal, #18181b);
      color: var(--bg-blanco, #ffffff);
      border-color: var(--texto-principal, #18181b);
    }
    
    .primary-voice:hover {
      background: #000000;
      border-color: #000000;
      transform: translateY(-4px);
      box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.3);
    }
    
    .secondary-catalog {
      background: var(--bg-blanco, #ffffff);
      color: var(--texto-principal, #18181b);
    }
    
    .secondary-catalog:hover {
      background: var(--bg-primary, #faf9f6);
      border-color: var(--color-borde-hover, #a1a1aa);
      transform: translateY(-4px);
      box-shadow: var(--shadow-hover);
    }
    
    .icon-circle {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      color: var(--bg-blanco, #ffffff);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.3s ease;
    }
    
    .primary-voice .icon-circle {
      background: var(--color-accion, #4f46e5);
    }
    
    .primary-voice:hover .icon-circle {
      transform: scale(1.1);
    }
    
    .icon-square {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-sm, 6px);
      background: var(--bg-primary, #faf9f6);
      color: var(--texto-principal, #18181b);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.3s ease;
    }
    
    .secondary-catalog:hover .icon-square {
      transform: scale(1.1);
      background: var(--bg-blanco, #ffffff);
      border: 1px solid var(--color-borde, #e4e4e7);
    }
    
    .action-text {
      flex: 1;
    }
    
    .badge-core {
      display: inline-block;
      font-size: 0.6rem;
      font-weight: 800;
      background: var(--color-accion, #4f46e5);
      color: var(--bg-blanco, #ffffff);
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      letter-spacing: 0.08em;
    }
    
    .action-text h2 {
      font-family: var(--font-display);
      font-size: 1.35rem;
      font-weight: 700;
      margin: 0 0 0.35rem 0;
      letter-spacing: -0.02em;
    }
    
    .action-text p {
      font-size: 0.9rem;
      margin: 0;
      opacity: 0.8;
      line-height: 1.5;
    }
    
    .arrow-icon {
      font-size: 1.4rem;
      opacity: 0.5;
      transition: transform 0.3s ease, opacity 0.3s ease;
    }
    
    .action-btn:hover .arrow-icon {
      transform: translateX(6px);
      opacity: 1;
    }
    
    .gate-footer {
      border-top: 1px solid var(--color-borde, #e4e4e7);
      padding-top: 2rem;
      font-size: 0.85rem;
      color: var(--texto-secundario, #52525b);
      display: flex;
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }
    
    .gate-footer p {
      margin: 0;
      line-height: 1.5;
    }
    
    .footer-links {
      display: flex;
      justify-content: center;
      gap: 1rem;
      align-items: center;
    }
    
    .link-item {
      color: var(--texto-principal, #18181b);
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s ease;
    }
    
    .link-item:hover {
      color: var(--color-accion, #4f46e5);
    }
    
    .divider {
      color: var(--color-borde, #e4e4e7);
    }
  `]
})
export class GateComponent {}
