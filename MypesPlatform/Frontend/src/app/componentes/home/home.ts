import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../core/services/producto.service';
import { TiendaService } from '../../core/services/tienda.service';
import { AuthService } from '../../core/services/auth.service';
import { ProductoDTO, TiendaDTO } from '../../core/models/platform.models';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  productos: ProductoDTO[] = [];
  tiendas: TiendaDTO[] = [];
  misProductos: ProductoDTO[] = [];
  miTienda: TiendaDTO | null = null;
  isLoading = true;
  error = '';
  searchTerm = '';
  isAdmin = false;
  showAdminView = false;
  isLoadingAdmin = false;
  adminError = '';

  constructor(
    private productoService: ProductoService,
    private tiendaService: TiendaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarDatosPublicos();
    this.isAdmin = this.authService.isAdmin();
    if (this.isAdmin) {
      this.cargarVistaAdmin();
    }
  }

  cargarDatosPublicos(): void {
    this.productoService.listar().subscribe({
      next: (data) => {
        this.productos = data;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los datos. Verifica que el backend esté corriendo.';
        this.isLoading = false;
      },
    });

    this.tiendaService.findAll().subscribe({
      next: (data) => (this.tiendas = data),
      error: () => {},
    });
  }

  cargarVistaAdmin(): void {
    this.isLoadingAdmin = true;
    this.showAdminView = true;

    this.tiendaService.miTienda().subscribe({
      next: (data) => {
        this.miTienda = data;
        this.isLoadingAdmin = false;
      },
      error: () => {
        this.miTienda = null;
        this.isLoadingAdmin = false;
      },
    });

    this.productoService.misProductos().subscribe({
      next: (data) => (this.misProductos = data),
      error: () => {},
    });
  }

  filteredTiendas(): TiendaDTO[] {
    if (!this.searchTerm.trim()) return this.tiendas;
    const q = this.searchTerm.toLowerCase();
    return this.tiendas.filter((t) => t.nombre.toLowerCase().includes(q));
  }

  filteredProductos(): ProductoDTO[] {
    if (!this.searchTerm.trim()) return this.productos;
    const q = this.searchTerm.toLowerCase();
    return this.productos.filter((p) => p.nombre.toLowerCase().includes(q));
  }

  nombreTienda(tiendaId: number | undefined): string {
    if (!tiendaId) return '';
    const t = this.tiendas.find((x) => x.tiendaId === tiendaId);
    return t ? t.nombre : '';
  }

  imagenTienda(nombre: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&size=240&background=e8eef5&color=0056b3&bold=true`;
  }
}
