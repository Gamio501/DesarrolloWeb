import {
  Component,
  EventEmitter,
  OnDestroy,
  Output,
  signal,
} from '@angular/core';
import { NgIf } from '@angular/common';

// Los tipos de SpeechRecognition provienen de src/speech-recognition.d.ts

type MicState = 'idle' | 'listening' | 'error';

@Component({
  selector: 'app-mic-button',
  standalone: true,
  imports: [NgIf],
  templateUrl: './mic-button.component.html',
  styleUrl: './mic-button.component.scss',
})
export class MicButtonComponent implements OnDestroy {

  /** Emite el texto reconocido al componente padre */
  @Output() voiceText = new EventEmitter<string>();

  state = signal<MicState>('idle');
  tooltip = signal<string>('Buscar por voz');

  private recognition: SpeechRecognition | null = null;
  private supported = this.detectSupport();

  // ── Detección de soporte ────────────────────────────────────────────────
  private detectSupport(): boolean {
    const ctor: (new () => SpeechRecognition) | undefined =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    return !!ctor;
  }

  // ── Toggle micrófono ────────────────────────────────────────────────────
  toggle(): void {
    if (!this.supported) {
      this.state.set('error');
      this.tooltip.set('Tu navegador no soporta voz. Usa Chrome.');
      return;
    }
    if (this.state() === 'listening') {
      this.stop();
    } else {
      this.start();
    }
  }

  private start(): void {
    const SpeechRecognitionCtor: (new () => SpeechRecognition) | undefined =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) return;

    this.recognition = new SpeechRecognitionCtor();
    this.recognition.lang = 'es-PE';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const texto = event.results[0]?.[0]?.transcript ?? '';
      if (texto.trim()) {
        this.voiceText.emit(texto.trim());
      }
      this.state.set('idle');
      this.tooltip.set('Buscar por voz');
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const mensajes: Record<string, string> = {
        'not-allowed':   'Permiso denegado. Habilita el micrófono.',
        'no-speech':     'No se detectó voz. Intenta de nuevo.',
        'audio-capture': 'No se encontró micrófono.',
        'network':       'Error de red.',
      };
      this.tooltip.set(mensajes[event.error] ?? 'Error de voz.');
      this.state.set('error');
      setTimeout(() => {
        if (this.state() === 'error') {
          this.state.set('idle');
          this.tooltip.set('Buscar por voz');
        }
      }, 3000);
    };

    this.recognition.onend = () => {
      if (this.state() === 'listening') {
        this.state.set('idle');
        this.tooltip.set('Buscar por voz');
      }
    };

    this.recognition.start();
    this.state.set('listening');
    this.tooltip.set('Escuchando… Haz clic para detener');
  }

  private stop(): void {
    this.recognition?.stop();
    this.state.set('idle');
    this.tooltip.set('Buscar por voz');
  }

  ngOnDestroy(): void {
    this.recognition?.abort();
  }

  get isListening(): boolean { return this.state() === 'listening'; }
  get isError(): boolean     { return this.state() === 'error'; }
}
