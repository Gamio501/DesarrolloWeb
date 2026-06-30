import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductoService } from '../../core/services/producto.service';
import { ProductoDTO } from '../../core/models/platform.models';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  productos: ProductoDTO[] = [];
  isLoading = true;
  error = '';

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.productoService.listar().subscribe({
      next: (data) => {
        this.productos = data;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los productos. Verifica la conexión con el backend.';
        this.isLoading = false;
      },
    });
  }
}