import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductoService } from '../../core/services/producto.service';
import { ProductoDTO } from '../../core/models/platform.models';
import { DataTableComponent, ColumnConfig } from '../../shared/components/data-table/data-table';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

@Component({
  selector: 'app-productos',
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
    <app-page-header title="Productos" subtitle="Gestiona los productos de tu tienda">
      <button mat-raised-button color="primary" routerLink="/productos/nuevo">
        <mat-icon>add</mat-icon>
        Nuevo Producto
      </button>
    </app-page-header>

    @if (isLoading) {
      <div class="loading-section">
        <mat-spinner diameter="36" />
      </div>
    } @else {
      <app-data-table
        [title]="'productos'"
        [columns]="columns"
        [data]="productos"
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
export class ProductosComponent implements OnInit {
  productos: ProductoDTO[] = [];
  isLoading = true;

  columns: ColumnConfig[] = [
    { key: 'productoId', label: 'ID', sortable: true },
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'precio', label: 'Precio', sortable: true, pipe: 'currency' },
    { key: 'stock', label: 'Stock', sortable: true },
  ];

  constructor(
    private productoService: ProductoService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productoService.misProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  handleAction(event: { action: string; row: unknown }): void {
    const p = event.row as ProductoDTO;
    switch (event.action) {
      case 'view':
        this.router.navigate(['/productos', p.productoId]);
        break;
      case 'edit':
        this.router.navigate(['/productos', p.productoId, 'editar']);
        break;
      case 'delete':
        this.confirmDelete(p);
        break;
    }
  }

  private confirmDelete(p: ProductoDTO): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar producto',
        message: `¿Estás seguro de eliminar "${p.nombre}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        color: 'warn',
      },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
      }
    });
  }
}
