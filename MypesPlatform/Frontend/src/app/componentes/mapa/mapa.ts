import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TiendaService } from '../../servicios/tienda';
import { GeolocalizacionService, CoordenadaUsuario } from '../../servicios/geolocalizacion';
import { Tienda } from '../../modelos/tienda';
import * as L from 'leaflet';

// Leaflet no puede autodetectar la ruta de sus propios íconos cuando el CSS
// está bundleado (Angular/esbuild) — sin esto, los markers salen rotos (404).
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

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
  tiendasVista: (Tienda & { distanciaKm: number | null })[] = [];
  tiendaSeleccionada: Tienda | null = null;
  estadoUbicacion: 'cargando' | 'ok' | 'error' = 'cargando';
  errorUbicacion = '';
  cargandoTiendas = true;

  private posicionUsuario: CoordenadaUsuario | null = null;
  private map: L.Map | null = null;
  private marcadorUsuario: L.CircleMarker | null = null;
  private marcadoresTiendas: Map<number, L.Marker> = new Map();
  private readonly CENTRO_DEFAULT: [number, number] = [-12.0464, -77.0428];
  private readonly LIMITES_PERU = L.latLngBounds(
    L.latLng(-18.5, -81.5),
    L.latLng(0.5, -68.0)
  );

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

    this.map = L.map(this.contenedorId, {
      maxBounds: this.LIMITES_PERU,
      maxBoundsViscosity: 1.0,
      minZoom: 5,
    }).setView(centro, zoom);

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
        this.actualizarVistaOrdenada();
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
        this.posicionUsuario = coord;
        this.actualizarMapaUsuario(coord);
        this.actualizarVistaOrdenada();
      },
      error: (msg: string) => {
        this.estadoUbicacion = 'error';
        this.errorUbicacion = msg;
      },
    });
  }

  /** Ordena las tiendas por cercanía a la posición del usuario (Haversine). Sin ubicación, deja el orden tal cual. */
  private actualizarVistaOrdenada(): void {
    const conDistancia = this.tiendas.map((tienda) => {
      const distanciaKm = this.posicionUsuario && tienda.latitud != null && tienda.longitud != null
        ? this.calcularDistanciaKm(
            this.posicionUsuario.latitud,
            this.posicionUsuario.longitud,
            tienda.latitud,
            tienda.longitud
          )
        : null;
      return { ...tienda, distanciaKm };
    });

    conDistancia.sort((a, b) => {
      if (a.distanciaKm == null && b.distanciaKm == null) return 0;
      if (a.distanciaKm == null) return 1;
      if (b.distanciaKm == null) return -1;
      return a.distanciaKm - b.distanciaKm;
    });

    this.tiendasVista = conDistancia;
  }

  private calcularDistanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.gradosARadianes(lat2 - lat1);
    const dLon = this.gradosARadianes(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.gradosARadianes(lat1)) *
        Math.cos(this.gradosARadianes(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private gradosARadianes(grados: number): number {
    return (grados * Math.PI) / 180;
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
        `<b>${tienda.nombre}</b><br>${tienda.direccion}<br>${tienda.telefono}`
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
