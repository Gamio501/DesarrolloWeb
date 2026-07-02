import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [ngClass]="colorClass">
      {{ label }}
    </span>
  `,
  styles: [
    `
      .status-badge {
        display: inline-block;
        padding: 0.2rem 0.7rem;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 500;
        line-height: 1.4;
      }
      .badge-active {
        background: #e8f5e9;
        color: #2e7d32;
      }
      .badge-inactive {
        background: #fce4ec;
        color: #c62828;
      }
      .badge-pending {
        background: #fff3e0;
        color: #e65100;
      }
      .badge-info {
        background: #e3f2fd;
        color: #1565c0;
      }
      .badge-default {
        background: #f5f5f5;
        color: #616161;
      }
    `,
  ],
})
export class StatusBadgeComponent {
  @Input() label = '';
  @Input() color: 'active' | 'inactive' | 'pending' | 'info' | 'default' = 'default';

  get colorClass(): string {
    return `badge-${this.color}`;
  }
}
