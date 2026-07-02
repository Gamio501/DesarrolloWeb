import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="empty-state">
      <mat-icon class="empty-icon">{{ icon }}</mat-icon>
      <p class="empty-message">{{ message }}</p>
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2.5rem 1rem;
        color: #999;
      }
      .empty-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        margin-bottom: 0.75rem;
        opacity: 0.5;
      }
      .empty-message {
        margin: 0;
        font-size: 0.95rem;
      }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() message = 'No hay datos disponibles.';
  @Input() icon = 'inbox';
}
