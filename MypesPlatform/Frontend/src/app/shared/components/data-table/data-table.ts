import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EmptyStateComponent } from '../empty-state/empty-state';

export interface ColumnConfig {
  key: string;
  label: string;
  sortable?: boolean;
  pipe?: 'currency' | 'uppercase' | 'titlecase';
  badge?: (value: unknown) => { text: string; class: string };
  template?: 'status' | 'actions';
}

export interface ActionEvent {
  action: 'view' | 'edit' | 'delete' | 'toggle';
  row: unknown;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    EmptyStateComponent,
  ],
  template: `
    <div class="data-table-wrapper">
      <div class="data-table-toolbar">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="search-field">
          <mat-label>Buscar</mat-label>
          <input
            matInput
            [(ngModel)]="searchTerm"
            (input)="applyFilter()"
            placeholder="Buscar en {{ title }}..."
          />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        @if (showAdd) {
          <button mat-raised-button color="primary" (click)="add.emit()">
            <mat-icon>add</mat-icon>
            {{ addLabel }}
          </button>
        }
      </div>

      <div class="table-container mat-elevation-z1">
        <table
          mat-table
          [dataSource]="dataSource"
          matSort
          matSortActive
          class="full-width"
        >
          <ng-container
            *ngFor="let col of columns; let i = index"
            [matColumnDef]="col.key"
          >
            <th
              mat-header-cell
              *matHeaderCellDef
              mat-sort-header
              [disabled]="col.sortable === false"
            >
              {{ col.label }}
            </th>
            <td mat-cell *matCellDef="let row">
              @if (col.template === 'status') {
                <span
                  class="status-badge"
                  [ngClass]="col.badge ? col.badge(row[col.key]).class : ''"
                >
                  {{ col.badge ? col.badge(row[col.key]).text : row[col.key] }}
                </span>
              } @else {
                {{ formatValue(row[col.key], col.pipe) }}
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let row">
              <button
                mat-icon-button
                color="primary"
                matTooltip="Ver detalle"
                (click)="emitAction('view', row)"
              >
                <mat-icon>visibility</mat-icon>
              </button>
              <button
                mat-icon-button
                color="accent"
                matTooltip="Editar"
                (click)="emitAction('edit', row)"
              >
                <mat-icon>edit</mat-icon>
              </button>
              <button
                mat-icon-button
                color="warn"
                matTooltip="Eliminar"
                (click)="emitAction('delete', row)"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr
            mat-row
            *matRowDef="let row; columns: displayedColumns"
            class="table-row"
          ></tr>

          @if (!dataSource.data.length) {
            <tr class="mat-row">
              <td class="mat-cell empty-cell" [attr.colspan]="displayedColumns.length">
                <app-empty-state
                  [message]="emptyMessage"
                  [icon]="emptyIcon"
                />
              </td>
            </tr>
          }
        </table>
      </div>

      <mat-paginator
        [pageSizeOptions]="[5, 10, 25, 50]"
        [pageSize]="10"
        showFirstLastButtons
        aria-label="Paginación"
      >
      </mat-paginator>
    </div>
  `,
  styles: [
    `
      .data-table-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .data-table-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .search-field {
        min-width: 260px;
        flex: 1;
        max-width: 400px;
      }
      .table-container {
        overflow-x: auto;
        border-radius: 8px;
        background: #fff;
      }
      .full-width {
        width: 100%;
      }
      .table-row:hover {
        background: #f5f5f5;
      }
      .empty-cell {
        text-align: center;
        padding: 2rem !important;
      }
      .status-badge {
        display: inline-block;
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 500;
      }
      .status-badge.active {
        background: #e8f5e9;
        color: #2e7d32;
      }
      .status-badge.inactive {
        background: #fce4ec;
        color: #c62828;
      }
      .status-badge.pending {
        background: #fff3e0;
        color: #e65100;
      }
    `,
  ],
})
export class DataTableComponent<T> implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Input() title = '';
  @Input() columns: ColumnConfig[] = [];
  @Input() data: T[] = [];
  @Input() showAdd = false;
  @Input() addLabel = 'Nuevo';
  @Input() emptyMessage = 'No hay datos disponibles.';
  @Input() emptyIcon = 'inbox';

  @Output() add = new EventEmitter<void>();
  @Output() action = new EventEmitter<ActionEvent>();

  searchTerm = '';
  dataSource = new MatTableDataSource<T>([]);

  get displayedColumns(): string[] {
    return [...this.columns.map((c) => c.key), 'actions'];
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.data = this.data;
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  formatValue(value: unknown, pipe?: string): string {
    if (value == null) return '-';
    if (pipe === 'currency') {
      return `S/ ${Number(value).toFixed(2)}`;
    }
    if (pipe === 'uppercase') return String(value).toUpperCase();
    if (pipe === 'titlecase') {
      return String(value).replace(/\b\w/g, (c) => c.toUpperCase());
    }
    return String(value);
  }

  emitAction(action: string, row: T): void {
    if (action === 'delete') {
      this.action.emit({ action: 'delete', row });
    } else if (action === 'edit') {
      this.action.emit({ action: 'edit', row });
    } else if (action === 'view') {
      this.action.emit({ action: 'view', row });
    }
  }
}
