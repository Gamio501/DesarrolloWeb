import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Producto } from '../../modelos/producto';
import { TiendaService } from '../../servicios/tienda';
import { NgFor, NgIf } from '@angular/common';
import { FiltrarPipe } from '../../pipes/filtrar.pipe';

@Component({
  selector: 'app-tiendas-productos',
  imports: [NgFor, NgIf, FiltrarPipe],
  templateUrl: './tiendas-productos.html',
  styleUrl: './tiendas-productos.scss',
})
export class TiendasProductos implements OnInit, OnChanges {

  @Input() tiendaId: number | null = null;
  @Input() busqueda: string = '';

  todosLosProductos: Producto[] = [];
  productosFiltrados: Producto[] = [];

  constructor(private tienda: TiendaService) { }

  ngOnInit(): void {
    this.tienda.obtenerProductosAll().subscribe({
      next: (data: Producto[]) => {
        this.todosLosProductos = data;
        this.aplicarFiltros();
      },
      error: (error) => console.log('Error al cargar productos', error)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tiendaId'] || changes['busqueda']) {
      this.aplicarFiltros();
    }
  }

  aplicarFiltros(): void {
    let resultado = this.todosLosProductos;

    if (this.tiendaId !== null) {
      resultado = resultado.filter(p => p.tiendaId === this.tiendaId);
    }

    this.productosFiltrados = resultado;
  }

  encodeURIComponent(value: string): string {
    return encodeURIComponent(value);
  }

}
