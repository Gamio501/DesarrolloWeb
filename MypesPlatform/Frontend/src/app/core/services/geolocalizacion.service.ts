import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

export interface CoordenadaUsuario {
  latitud: number;
  longitud: number;
  precision: number;
}

/**
 * Servicio @Injectable que encapsula la Web API navigator.geolocation.
 * Retorna un Observable para integración reactiva con componentes Angular.
 */
@Injectable({
  providedIn: 'root',
})
export class GeolocalizacionService {

  /**
   * Obtiene la posición actual del usuario.
   * Usa navigator.geolocation.getCurrentPosition() de la Web API del navegador.
   *
   * @returns Observable<CoordenadaUsuario> con lat, lng y precisión en metros
   */
  obtenerPosicion(): Observable<CoordenadaUsuario> {
    return new Observable((observer) => {
      if (!navigator.geolocation) {
        observer.error(
          'La geolocalización no está disponible en este navegador.'
        );
        return;
      }

      navigator.geolocation.getCurrentPosition(
        // Éxito
        (position: GeolocationPosition) => {
          observer.next({
            latitud: position.coords.latitude,
            longitud: position.coords.longitude,
            precision: position.coords.accuracy,
          });
          observer.complete();
        },
        // Error
        (error: GeolocationPositionError) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              observer.error(
                'Permiso de ubicación denegado. Habilítalo en tu navegador.'
              );
              break;
            case error.POSITION_UNAVAILABLE:
              observer.error(
                'La información de ubicación no está disponible.'
              );
              break;
            case error.TIMEOUT:
              observer.error(
                'La solicitud de ubicación excedió el tiempo de espera.'
              );
              break;
            default:
              observer.error('Error desconocido al obtener la ubicación.');
          }
        },
        // Opciones
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * Observa la posición en tiempo real (seguimiento continuo).
   * Retorna el ID del watcher para poder cancelarlo.
   */
  observarPosicion(
    onSuccess: (coord: CoordenadaUsuario) => void,
    onError: (msg: string) => void
  ): number {
    return navigator.geolocation.watchPosition(
      (pos) =>
        onSuccess({
          latitud: pos.coords.latitude,
          longitud: pos.coords.longitude,
          precision: pos.coords.accuracy,
        }),
      (err) => onError(err.message),
      { enableHighAccuracy: true }
    );
  }

  /**
   * Cancela el seguimiento continuo de posición.
   */
  cancelarObservacion(watchId: number): void {
    navigator.geolocation.clearWatch(watchId);
  }
}
