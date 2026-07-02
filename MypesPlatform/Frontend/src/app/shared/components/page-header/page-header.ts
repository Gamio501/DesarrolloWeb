import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-header">
      <div class="page-header-info">
        <h1 class="page-title">{{ title }}</h1>
        @if (subtitle) {
          <p class="page-subtitle">{{ subtitle }}</p>
        }
      </div>
      <div class="page-header-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }
      .page-title {
        margin: 0;
        font-size: 1.6rem;
        font-weight: 600;
        color: #1a1a1a;
      }
      .page-subtitle {
        margin: 0.25rem 0 0;
        color: #666;
        font-size: 0.9rem;
      }
    `,
  ],
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
