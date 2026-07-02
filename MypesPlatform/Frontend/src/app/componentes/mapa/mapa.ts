import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TiendaService } from '../../core/services/tienda.service';
import { GeolocalizacionService, CoordenadaUsuario } from '../../core/services/geolocalizacion.service';
import { TiendaDTO } from '../../core/models/platform.models';
import * as L from 'leaflet';

@Component({
  selector: 'app-mapa',
  imports: [CommonModule],
  templateUrl: './mapa.html',
  styleUrl: './mapa.scss',
})
export class Mapa implements OnInit, AfterViewInit {
  tiendas: TiendaDTO[] = [];
  tiendaSeleccionada: TiendaDTO | null = null;
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

  ngOnInit(): void {
    this.obtenerUbicacion();
    this.cargarTiendas();
  }

  ngAfterViewInit(): void {
    this.inicializarMapa();
  }

  private inicializarMapa(): void {
    this.map = L.map('mapa-leaflet').setView(this.CENTRO_DEFAULT, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);
  }

  private cargarTiendas(): void {
    this.tiendaService.findAll().subscribe({
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

      this.marcadoresTiendas.set(tienda.tiendaId!, marker);
    }
  }

  seleccionarTienda(tienda: TiendaDTO): void {
    this.tiendaSeleccionada = tienda;

    if (tienda.latitud != null && tienda.longitud != null) {
      const latLng: L.LatLngExpression = [tienda.latitud, tienda.longitud];

      if (this.map) {
        this.map.flyTo(latLng, 16);
      }

      const marker = this.marcadoresTiendas.get(tienda.tiendaId!);
      if (marker) {
        marker.openPopup();
      }
    }
  }
}
