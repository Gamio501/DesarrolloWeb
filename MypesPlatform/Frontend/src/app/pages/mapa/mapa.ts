import { Component, AfterViewInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { TiendaService } from '../../core/services/tienda.service';
import { GeolocalizacionService } from '../../core/services/geolocalizacion.service';
import { TiendaDTO } from '../../core/models/platform.models';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mapa-container">
      <div class="mapa-sidebar">
        <h2>Tiendas</h2>
        @if (tiendas().length === 0) {
          <p class="empty-msg">No hay tiendas disponibles.</p>
        }
        <div class="tiendas-list">
          @for (t of tiendas(); track t.tiendaId) {
            <div
              class="tienda-item"
              (click)="flyToTienda(t)"
              [class.active]="selectedId() === t.tiendaId"
            >
              <strong>{{ t.nombre }}</strong>
              <small>{{ t.direccion }}</small>
            </div>
          }
        </div>
      </div>
      <div id="mapa-leaflet" class="mapa-leaflet"></div>
    </div>
  `,
  styles: [
    `
      .mapa-container {
        display: flex;
        height: calc(100vh - 64px);
      }
      .mapa-sidebar {
        width: 300px;
        background: #fff;
        border-right: 1px solid #e0e0e0;
        padding: 1rem;
        overflow-y: auto;
      }
      .mapa-sidebar h2 {
        margin: 0 0 1rem;
        font-size: 1.1rem;
        font-weight: 600;
      }
      .tiendas-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .tienda-item {
        padding: 0.75rem;
        border-radius: 8px;
        cursor: pointer;
        border: 1px solid #eee;
        transition: all 0.15s;
      }
      .tienda-item:hover {
        background: #f5f5f5;
        border-color: #1565c0;
      }
      .tienda-item.active {
        background: #e3f2fd;
        border-color: #1565c0;
      }
      .tienda-item small {
        display: block;
        color: #666;
        font-size: 0.8rem;
        margin-top: 0.2rem;
      }
      .mapa-leaflet {
        flex: 1;
        z-index: 1;
      }
      .empty-msg {
        color: #999;
        text-align: center;
        padding: 2rem 0;
      }
      @media (max-width: 768px) {
        .mapa-container {
          flex-direction: column-reverse;
        }
        .mapa-sidebar {
          width: 100%;
          max-height: 200px;
          border-right: none;
          border-top: 1px solid #e0e0e0;
        }
        .mapa-leaflet {
          height: calc(100vh - 64px - 200px);
        }
      }
    `,
  ],
})
export class MapaComponent implements AfterViewInit, OnDestroy {
  private map: L.Map | null = null;
  private markers: L.Marker[] = [];
  tiendas = signal<TiendaDTO[]>([]);
  selectedId = signal<number | null>(null);

  constructor(
    private tiendaService: TiendaService,
    private geolocService: GeolocalizacionService
  ) {}

  ngAfterViewInit(): void {
    this.initMap();
    this.cargarTiendas();
  }

  ngOnDestroy(): void {
    this.markers.forEach((m) => this.map?.removeLayer(m));
    this.map?.remove();
  }

  private initMap(): void {
    this.map = L.map('mapa-leaflet', {
      center: [-5.1945, -80.6328],
      zoom: 13,
      zoomControl: true,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);
  }

  private cargarTiendas(): void {
    this.tiendaService.findAll().subscribe({
      next: (data) => {
        this.tiendas.set(data);
        this.agregarMarcadores(data);
      },
      error: () => {},
    });
  }

  private agregarMarcadores(tiendas: TiendaDTO[]): void {
    this.markers.forEach((m) => this.map?.removeLayer(m));
    this.markers = [];
    tiendas.forEach((t) => {
      if (t.latitud && t.longitud) {
        const marker = L.marker([t.latitud, t.longitud])
          .addTo(this.map!)
          .bindPopup(
            `<strong>${t.nombre}</strong><br/>${t.direccion}<br/><a href="/tienda/${t.tiendaId}">Ver tienda</a>`
          );
        marker.on('click', () => this.selectedId.set(t.tiendaId ?? null));
        this.markers.push(marker);
      }
    });
  }

  flyToTienda(tienda: TiendaDTO): void {
    if (tienda.latitud && tienda.longitud && this.map) {
      this.map.flyTo([tienda.latitud, tienda.longitud], 16, { duration: 0.8 });
      this.selectedId.set(tienda.tiendaId ?? null);
    }
  }
}
