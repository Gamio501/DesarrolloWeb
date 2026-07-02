import { Injectable, OnDestroy } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class WebsocketService implements OnDestroy {
    private client: Client;
    private messageSubject = new BehaviorSubject<string>('');

    constructor() {
        this.client = new Client({
            webSocketFactory: () => new (SockJS as any)('http://localhost:8080/ws'),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onConnect = () => {
            this.client.subscribe('/topic/messages', (message: Message) => {
                if (message.body) {
                    this.messageSubject.next(message.body);
                }
            });
        };

        this.client.onStompError = (frame) => {
            console.error(frame.headers['message'], frame.body);
        };

        this.client.activate();
    }

    public getMessages(): Observable<string> {
        return this.messageSubject.asObservable();
    }

    public sendMessage(msg: string): void {
        if (this.client && this.client.connected) {
            this.client.publish({ destination: '/app/hello', body: msg });
        }
    }

    public disconnect(): void {
        if (this.client) {
            this.client.deactivate();
        }
    }

    ngOnDestroy(): void {
        this.disconnect();
    }
}
