import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Producto } from '../../modelos/producto';
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
  subiendo = false;
  imagenSeleccionada: File | null = null;

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

  onImagenProductoSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imagenSeleccionada = input.files[0];
    }
  }

  guardarProductos() {
    if (this.productoForm.invalid) {
      return;
    }

    const nuevoProducto: Producto = this.productoForm.value;

    this.tiendaService.agregarNuevosProductosAdmin(nuevoProducto).subscribe({
      next: (data) => {
        if (this.imagenSeleccionada) {
          this.subirImagenYActualizar(data);
        } else {
          this.productos.push(data);
          this.productoForm.reset();
          this.imagenSeleccionada = null;
        }
      },
      error: (error: any) => console.log('Error al guardar', error)
    })
  }

  cambiarImagen(producto: Producto, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const archivo = input.files[0];
    this.subiendo = true;

    this.tiendaService.subirImagen(archivo).subscribe({
      next: (res) => {
        this.tiendaService.actualizarImagenProducto(producto.productoId!, res.url).subscribe({
          next: () => {
            producto.imagenUrl = res.url;
            this.subiendo = false;
          },
          error: (err) => {
            console.log('Error al guardar imagen', err);
            this.subiendo = false;
          }
        });
      },
      error: (err) => {
        console.log('Error al subir imagen', err);
        this.subiendo = false;
      }
    });
  }

  private subirImagenYActualizar(producto: Producto): void {
    if (!this.imagenSeleccionada) return;
    this.subiendo = true;

    this.tiendaService.subirImagen(this.imagenSeleccionada).subscribe({
      next: (res) => {
        this.tiendaService.actualizarImagenProducto(producto.productoId!, res.url).subscribe({
          next: () => {
            producto.imagenUrl = res.url;
            this.productos.push(producto);
            this.productoForm.reset();
            this.imagenSeleccionada = null;
            this.subiendo = false;
          },
          error: (err) => {
            console.log('Error al guardar imagen', err);
            this.subiendo = false;
          }
        });
      },
      error: (err) => {
        console.log('Error al subir imagen', err);
        this.subiendo = false;
      }
    });
  }
}
