import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebsocketService } from '../../servicios/WebSocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  messages: string[] = [];
  input = '';
  private sub!: Subscription;

  constructor(private wsService: WebsocketService) {}

  ngOnInit(): void {
    this.sub = this.wsService.getMessages().subscribe((msg) => {
      if (msg) this.messages.push(msg);
    });
  }

  send(): void {
    if (this.input.trim()) {
      this.wsService.sendMessage(this.input.trim());
      this.input = '';
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}