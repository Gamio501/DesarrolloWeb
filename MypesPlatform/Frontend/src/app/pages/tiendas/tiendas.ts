import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TiendaService } from '../../core/services/tienda.service';
import { TiendaDTO } from '../../core/models/platform.models';
import { DataTableComponent, ColumnConfig } from '../../shared/components/data-table/data-table';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

@Component({
  selector: 'app-tiendas',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DataTableComponent,
    PageHeaderComponent,
  ],
  template: `
    <app-page-header title="Tiendas" subtitle="Gestiona las tiendas registradas">
      <button mat-raised-button color="primary" routerLink="/tiendas/nuevo">
        <mat-icon>add</mat-icon>
        Nueva Tienda
      </button>
    </app-page-header>

    @if (isLoading) {
      <div class="loading-section">
        <mat-spinner diameter="36" />
      </div>
    } @else {
      <app-data-table
        [title]="'tiendas'"
        [columns]="columns"
        [data]="tiendas"
        (action)="handleAction($event)"
      ></app-data-table>
    }
  `,
  styles: [
    `
      .loading-section {
        display: flex;
        justify-content: center;
        padding: 3rem;
      }
    `,
  ],
})
export class TiendasComponent implements OnInit {
  tiendas: TiendaDTO[] = [];
  isLoading = true;

  columns: ColumnConfig[] = [
    { key: 'tiendaId', label: 'ID', sortable: true },
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'direccion', label: 'Dirección', sortable: true },
    { key: 'telefono', label: 'Teléfono', sortable: false },
  ];

  constructor(
    private tiendaService: TiendaService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.tiendaService.findAll().subscribe({
      next: (data) => {
        this.tiendas = data;
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  handleAction(event: { action: string; row: unknown }): void {
    const t = event.row as TiendaDTO;
    switch (event.action) {
      case 'view':
        this.router.navigate(['/tienda', t.tiendaId]);
        break;
      case 'edit':
        this.router.navigate(['/tiendas', t.tiendaId, 'editar']);
        break;
      case 'delete':
        break;
    }
  }
}
