import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductoService } from '../../core/services/producto.service';

@Component({
  selector: 'app-agregar-producto',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './agregar-producto.html',
  styleUrl: './agregar-producto.scss',
})
export class AgregarProducto {
  productoForm: FormGroup;
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private router: Router
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
    });
  }

  onSubmit(): void {
    if (this.productoForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.productoService.guardar(this.productoForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = '¡Producto guardado exitosamente!';
        this.productoForm.reset({ nombre: '', precio: 0, stock: 0 });
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Error al guardar el producto. Intenta de nuevo.';
      },
    });
  }
}
