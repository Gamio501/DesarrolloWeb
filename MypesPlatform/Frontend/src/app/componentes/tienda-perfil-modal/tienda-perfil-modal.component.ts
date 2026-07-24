import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TiendaService } from '../../servicios/tienda';
import { Auth } from '../../servicios/auth';
import { Tienda } from '../../modelos/tienda';
import { Valoracion } from '../../modelos/valoracion';

@Component({
  selector: 'app-tienda-perfil-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tienda-perfil-modal.component.html',
  styleUrl: './tienda-perfil-modal.component.scss'
})
export class TiendaPerfilModalComponent implements OnInit {

  @Input() tiendaId: number | null = null;
  @Output() cerrar = new EventEmitter<void>();
  @Output() valoracionEnviada = new EventEmitter<void>();

  tienda: Tienda | null = null;
  valoraciones: Valoracion[] = [];
  cargando = true;

  // Formulario de nueva valoración
  estrellasSeleccionadas = 5;
  comentario = '';
  enviando = false;
  mensajeExito = '';
  mensajeError = '';

  constructor(public tiendaService: TiendaService, public auth: Auth) {}

  ngOnInit(): void {
    if (this.tiendaId) {
      this.cargarDatosTienda(this.tiendaId);
    }
  }

  cargarDatosTienda(id: number): void {
    this.cargando = true;
    this.tiendaService.obtenerTiendaPorId(id).subscribe({
      next: (t) => {
        this.tienda = t;
        this.cargarValoraciones(id);
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  cargarValoraciones(id: number): void {
    this.tiendaService.obtenerValoraciones(id).subscribe({
      next: (vals) => {
        this.valoraciones = vals;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  seleccionarEstrellas(n: number): void {
    this.estrellasSeleccionadas = n;
  }

  enviarValoracion(): void {
    if (!this.tiendaId) return;
    this.enviando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    this.tiendaService.guardarValoracion(this.tiendaId, {
      estrellas: this.estrellasSeleccionadas,
      comentario: this.comentario.trim()
    }).subscribe({
      next: (nueva) => {
        this.enviando = false;
        this.mensajeExito = '¡Gracias! Tu valoración ha sido publicada.';
        this.comentario = '';
        this.estrellasSeleccionadas = 5;
        this.cargarDatosTienda(this.tiendaId!);
        this.valoracionEnviada.emit();
      },
      error: (err) => {
        this.enviando = false;
        this.mensajeError = err.error?.error || 'Error al guardar valoración. Verifica tu sesión.';
      }
    });
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }
}
