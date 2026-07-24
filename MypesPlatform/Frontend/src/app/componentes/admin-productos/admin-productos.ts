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

  imagenUrlElegida: string | null = null;
  buscandoFotos = false;
  resultadosBusqueda: string[] = [];
  busquedaRealizada = false;
  errorBusqueda: string | null = null;

  productoEditandoImagen: Producto | null = null;
  buscandoFotosExistente = false;
  resultadosBusquedaExistente: string[] = [];

  productoEditando: Producto | null = null;
  editForm: FormGroup;
  guardandoEdicion = false;

  constructor(private tiendaService: TiendaService, private fb: FormBuilder) {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      precio: [0, Validators.required],
      stock: [0, Validators.required]
    });
    this.editForm = this.fb.group({
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
      this.imagenUrlElegida = null;
      this.resultadosBusqueda = [];
    }
  }

  buscarFotosStock(): void {
    const nombre = this.productoForm.get('nombre')?.value?.trim();
    if (!nombre) {
      this.errorBusqueda = 'Escribe primero el nombre del producto.';
      return;
    }

    this.buscandoFotos = true;
    this.busquedaRealizada = false;
    this.errorBusqueda = null;
    this.resultadosBusqueda = [];

    this.tiendaService.buscarFotosStock(nombre).subscribe({
      next: (urls) => {
        this.resultadosBusqueda = urls;
        this.busquedaRealizada = true;
        this.buscandoFotos = false;
      },
      error: (error: any) => {
        console.log('Error al buscar fotos', error);
        this.errorBusqueda = 'No se pudo buscar. Intenta de nuevo.';
        this.buscandoFotos = false;
      }
    });
  }

  elegirFotoStock(url: string): void {
    this.imagenUrlElegida = url;
    this.imagenSeleccionada = null;
    this.resultadosBusqueda = [];
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
        } else if (this.imagenUrlElegida) {
          this.aplicarImagenElegida(data);
        } else {
          this.productos.push(data);
          this.productoForm.reset();
        }
      },
      error: (error: any) => console.log('Error al guardar', error)
    })
  }

  private aplicarImagenElegida(producto: Producto): void {
    this.tiendaService.elegirFotoStock(this.imagenUrlElegida!).subscribe({
      next: (res) => {
        this.tiendaService.actualizarImagenProducto(producto.productoId!, res.url).subscribe({
          next: () => {
            producto.imagenUrl = res.url;
            this.productos.push(producto);
            this.productoForm.reset();
            this.imagenUrlElegida = null;
          },
          error: (err) => console.log('Error al guardar imagen', err)
        });
      },
      error: (err) => console.log('Error al descargar imagen elegida', err)
    });
  }

  buscarFotoParaExistente(producto: Producto): void {
    this.productoEditandoImagen = producto;
    this.buscandoFotosExistente = true;
    this.resultadosBusquedaExistente = [];

    this.tiendaService.buscarFotosStock(producto.nombre).subscribe({
      next: (urls) => {
        this.resultadosBusquedaExistente = urls;
        this.buscandoFotosExistente = false;
      },
      error: (error: any) => {
        console.log('Error al buscar fotos', error);
        this.buscandoFotosExistente = false;
      }
    });
  }

  elegirFotoParaExistente(url: string): void {
    const producto = this.productoEditandoImagen;
    if (!producto) return;

    this.subiendo = true;
    this.tiendaService.elegirFotoStock(url).subscribe({
      next: (res) => {
        this.tiendaService.actualizarImagenProducto(producto.productoId!, res.url).subscribe({
          next: () => {
            producto.imagenUrl = res.url;
            this.resultadosBusquedaExistente = [];
            this.productoEditandoImagen = null;
            this.subiendo = false;
          },
          error: (err) => {
            console.log('Error al guardar imagen', err);
            this.subiendo = false;
          }
        });
      },
      error: (err) => {
        console.log('Error al descargar imagen elegida', err);
        this.subiendo = false;
      }
    });
  }

  cancelarBusquedaExistente(): void {
    this.productoEditandoImagen = null;
    this.resultadosBusquedaExistente = [];
  }

  iniciarEdicion(producto: Producto): void {
    this.productoEditando = producto;
    this.editForm.setValue({
      nombre: producto.nombre,
      precio: producto.precio,
      stock: producto.stock
    });
  }

  guardarEdicion(): void {
    if (this.editForm.invalid || !this.productoEditando) {
      return;
    }

    const producto = this.productoEditando;
    this.guardandoEdicion = true;

    this.tiendaService.actualizarProducto(producto.productoId!, this.editForm.value).subscribe({
      next: (actualizado) => {
        producto.nombre = actualizado.nombre;
        producto.precio = actualizado.precio;
        producto.stock = actualizado.stock;
        this.productoEditando = null;
        this.guardandoEdicion = false;
      },
      error: (error: any) => {
        console.log('Error al actualizar producto', error);
        this.guardandoEdicion = false;
      }
    });
  }

  cancelarEdicion(): void {
    this.productoEditando = null;
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
