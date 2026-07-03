import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private client: Client;
  private messageSubject = new Subject<any>();
  public messages$ = this.messageSubject.asObservable();

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/api/websocket'),
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      console.log('Conectado al WebSocket: ' + frame);

      this.client.subscribe('/topic/messages', (message: Message) => {
        if (message.body) {
          console.log('Mensaje recibido por WebSocket: ', message.body);
          this.messageSubject.next(message.body);
        }
      });
    };

    this.client.onStompError = (frame) => {
      console.error('Error de Broker: ' + frame.headers['message']);
      console.error('Detalles: ' + frame.body);
    };
  }

  public conectar(): void {
    if (!this.client.active) {
      this.client.activate();
    }
  }

  public desconectar(): void {
    if (this.client.active) {
      this.client.deactivate();
    }
  }

  public enviarMensaje(mensaje: string): void {
    if (this.client.active) {
      this.client.publish({
        destination: '/app/hello',
        body: mensaje
      });
    } else {
      console.warn('El WebSocket no está conectado');
    }
  }
}
