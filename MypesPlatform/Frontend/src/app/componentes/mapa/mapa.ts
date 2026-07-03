import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TiendaService } from '../../servicios/tienda';
import { GeolocalizacionService, CoordenadaUsuario } from '../../servicios/geolocalizacion';
import { Tienda } from '../../modelos/tienda';
import * as L from 'leaflet';

@Component({
  selector: 'app-mapa',
  imports: [CommonModule],
  templateUrl: './mapa.html',
  styleUrl: './mapa.scss',
})
export class Mapa implements OnInit, AfterViewInit {
  @Input() tiendaUnica: Tienda | null = null;
  @Input() contenedorId = 'mapa-leaflet';

  tiendas: Tienda[] = [];
  tiendaSeleccionada: Tienda | null = null;
  estadoUbicacion: 'cargando' | 'ok' | 'error' = 'cargando';
  errorUbicacion = '';
  cargandoTiendas = true;

  private map: L.Map | null = null;
  private marcadorUsuario: L.CircleMarker | null = null;
  private marcadoresTiendas: Map<number, L.Marker> = new Map();
  private readonly CENTRO_DEFAULT: [number, number] = [-12.0464, -77.0428];

  constructor(
    private tiendaService: TiendaService,
    private geoService: GeolocalizacionService
  ) {}

  get modoAdmin(): boolean {
    return !!this.tiendaUnica;
  }

  ngOnInit(): void {
    if (this.tiendaUnica) {
      this.tiendas = [this.tiendaUnica];
      this.tiendaSeleccionada = this.tiendaUnica;
      this.cargandoTiendas = false;
      return;
    }

    this.obtenerUbicacion();
    this.cargarTiendas();
  }

  ngAfterViewInit(): void {
    this.inicializarMapa();
  }

  private inicializarMapa(): void {
    const centro = this.tiendaUnica?.latitud != null && this.tiendaUnica?.longitud != null
      ? [this.tiendaUnica.latitud, this.tiendaUnica.longitud] as [number, number]
      : this.CENTRO_DEFAULT;
    const zoom = this.tiendaUnica ? 16 : 13;

    this.map = L.map(this.contenedorId).setView(centro, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    if (this.tiendaUnica) {
      this.agregarMarcadoresTiendas();
    }
  }

  private cargarTiendas(): void {
    this.tiendaService.listar().subscribe({
      next: (data) => {
        this.tiendas = data;
        this.cargandoTiendas = false;
        this.agregarMarcadoresTiendas();
      },
      error: () => {
        this.cargandoTiendas = false;
      },
    });
  }

  private obtenerUbicacion(): void {
    this.estadoUbicacion = 'cargando';
    this.geoService.obtenerPosicion().subscribe({
      next: (coord: CoordenadaUsuario) => {
        this.estadoUbicacion = 'ok';
        this.actualizarMapaUsuario(coord);
      },
      error: (msg: string) => {
        this.estadoUbicacion = 'error';
        this.errorUbicacion = msg;
      },
    });
  }

  private actualizarMapaUsuario(coord: CoordenadaUsuario): void {
    const latLng: L.LatLngExpression = [coord.latitud, coord.longitud];

    if (this.map) {
      this.map.setView(latLng, 14);
    }

    if (this.marcadorUsuario) {
      this.marcadorUsuario.setLatLng(latLng);
    } else if (this.map) {
      this.marcadorUsuario = L.circleMarker(latLng, {
        radius: 10,
        fillColor: '#3388ff',
        color: '#fff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(this.map);
      this.marcadorUsuario.bindPopup('<b>Tu ubicación</b>');
    }
  }

  private agregarMarcadoresTiendas(): void {
    if (!this.map) return;

    for (const tienda of this.tiendas) {
      if (tienda.latitud == null || tienda.longitud == null) continue;

      const latLng: L.LatLngExpression = [tienda.latitud, tienda.longitud];

      const marker = L.marker(latLng).addTo(this.map!);
      marker.bindPopup(
        `<b>${tienda.nombre}</b><br>📍 ${tienda.direccion}<br>📞 ${tienda.telefono}`
      );
      marker.on('click', () => {
        this.tiendaSeleccionada = tienda;
      });

      this.marcadoresTiendas.set(tienda.tiendaId, marker);
    }
  }

  seleccionarTienda(tienda: Tienda): void {
    this.tiendaSeleccionada = tienda;

    if (tienda.latitud != null && tienda.longitud != null) {
      const latLng: L.LatLngExpression = [tienda.latitud, tienda.longitud];

      if (this.map) {
        this.map.flyTo(latLng, 16);
      }

      const marker = this.marcadoresTiendas.get(tienda.tiendaId);
      if (marker) {
        marker.openPopup();
      }
    }
  }
}
