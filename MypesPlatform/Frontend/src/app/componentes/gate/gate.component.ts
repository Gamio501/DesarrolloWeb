import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-gate',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="gate-container">
      <div class="gate-card">
        <div class="brand-badge">MYPES Platform</div>
        <h1 class="gate-title">¿Cómo querés buscar hoy?</h1>
        <p class="gate-subtitle">Encontrá stock físico en tiendas locales cerca tuyo. Sin carrito, directo al producto.</p>

        <div class="gate-actions">
          <!-- Opción Principal: Búsqueda por Voz -->
          <a routerLink="/buscar" class="action-btn primary-voice">
            <div class="icon-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v1a7 7 0 0 1-14 0v-1"></path>
                <line x1="12" x2="12" y1="19" y2="22"></line>
              </svg>
            </div>
            <div class="action-text">
              <span class="badge-core">CORE DE BÚSQUEDA</span>
              <h2>Buscar por Voz</h2>
              <p>Decí qué producto buscás y te mostramos las tiendas cercanas con stock disponible.</p>
            </div>
            <span class="arrow-icon">→</span>
          </a>

          <!-- Opción Secundaria: Catálogo -->
          <a routerLink="/tiendas" class="action-btn secondary-catalog">
            <div class="icon-square">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="7" height="9" x="3" y="3" rx="1"></rect>
                <rect width="7" height="5" x="14" y="3" rx="1"></rect>
                <rect width="7" height="9" x="14" y="12" rx="1"></rect>
                <rect width="7" height="5" x="3" y="16" rx="1"></rect>
              </svg>
            </div>
            <div class="action-text">
              <h2>Ver Catálogo y Tiendas</h2>
              <p>Navegación manual por tiendas, productos y mapa interactivo.</p>
            </div>
            <span class="arrow-icon">→</span>
          </a>
        </div>

        <div class="gate-footer">
          <p>💡 Podés cambiar de modo de búsqueda en cualquier momento desde el menú superior.</p>
          <div class="footer-links">
            <a routerLink="/login">Iniciar Sesión</a>
            <span>•</span>
            <a routerLink="/register">Registrar MYPE (Admin)</a>
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
      background-color: #fafafa;
      font-family: system-ui, -apple-system, sans-serif;
      padding: 2rem;
    }
    .gate-card {
      max-width: 680px;
      width: 100%;
      background: #ffffff;
      border: 1px solid #e5e5e5;
      border-radius: 16px;
      padding: 3rem 2.5rem;
      box-shadow: 0 4px 24px rgba(0,0,0,0.02);
    }
    .brand-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #666;
      background: #f1f1f1;
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      margin-bottom: 1.5rem;
    }
    .gate-title {
      font-size: 2.25rem;
      font-weight: 800;
      color: #111;
      margin: 0 0 0.75rem 0;
      letter-spacing: -0.02em;
    }
    .gate-subtitle {
      font-size: 1.05rem;
      color: #555;
      margin: 0 0 2.5rem 0;
      line-height: 1.5;
    }
    .gate-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2.5rem;
    }
    .action-btn {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.5rem;
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.2s ease;
      border: 1px solid #e5e5e5;
    }
    .primary-voice {
      background: #000;
      color: #fff;
      border-color: #000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .primary-voice:hover {
      background: #222;
      transform: translateY(-2px);
    }
    .secondary-catalog {
      background: #fff;
      color: #111;
      border-color: #e5e5e5;
    }
    .secondary-catalog:hover {
      background: #f9f9f9;
      border-color: #ccc;
      transform: translateY(-2px);
    }
    .icon-circle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(255,255,255,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .primary-voice .icon-circle {
      background: #10b981;
      color: #fff;
    }
    .icon-square {
      width: 50px;
      height: 50px;
      border-radius: 10px;
      background: #f3f4f6;
      color: #374151;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .action-text {
      flex: 1;
    }
    .badge-core {
      display: inline-block;
      font-size: 0.65rem;
      font-weight: 700;
      background: #059669;
      color: #fff;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      margin-bottom: 0.35rem;
      letter-spacing: 0.05em;
    }
    .action-text h2 {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0 0 0.25rem 0;
    }
    .primary-voice h2 { color: #fff; }
    .secondary-catalog h2 { color: #111; }
    .action-text p {
      font-size: 0.9rem;
      margin: 0;
      opacity: 0.8;
      line-height: 1.4;
    }
    .arrow-icon {
      font-size: 1.25rem;
      font-weight: 600;
      opacity: 0.6;
      transition: transform 0.2s;
    }
    .action-btn:hover .arrow-icon {
      transform: translateX(4px);
      opacity: 1;
    }
    .gate-footer {
      border-top: 1px solid #eee;
      padding-top: 1.5rem;
      font-size: 0.85rem;
      color: #666;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      text-align: center;
    }
    .gate-footer p { margin: 0; }
    .footer-links {
      display: flex;
      justify-content: center;
      gap: 0.75rem;
      align-items: center;
    }
    .footer-links a {
      color: #111;
      text-decoration: none;
      font-weight: 600;
    }
    .footer-links a:hover { text-decoration: underline; }
  `]
})
export class GateComponent {}
