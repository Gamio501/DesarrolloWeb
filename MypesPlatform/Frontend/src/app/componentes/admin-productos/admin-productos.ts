import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Producto } from '../../modelos/producto';
import { MiTienda } from '../mi-tienda/mi-tienda';
import { TiendaService } from '../../servicios/tienda';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-productos',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-productos.html',
  styleUrl: './admin-productos.scss',
})
export class AdminProductos implements OnInit {

  productos: Producto[] = [];
  productoForm: FormGroup;

  constructor(private tiendaService: TiendaService, private fb: FormBuilder) {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      precio: [0, Validators.required],
      stock: [0, Validators.required]
    });
  }

  ngOnInit(): void {

    this.tiendaService.obtenerProductosAdmin().subscribe({
      next: (data) => {
        this.productos = data;
      },
      error: (error: any) => console.log('Error al obtener productos', error)
    })

  }

  guardarProductos() {

    if (this.productoForm.invalid) {
      return;
    }

    const nuevoProducto: Producto = this.productoForm.value;

    this.tiendaService.agregarNuevosProductosAdmin(nuevoProducto).subscribe({
      next: (data) => {
        this.productos.push(data);
        this.productoForm.reset();
      },
      error: (error: any) => console.log('Error al guardar', error)
    })

  }
}
