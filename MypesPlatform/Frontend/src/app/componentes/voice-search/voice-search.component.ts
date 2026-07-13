import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { TiendaService } from '../../servicios/tienda';
import { Producto } from '../../modelos/producto';

// Los tipos SpeechRecognition, SpeechRecognitionEvent y SpeechRecognitionErrorEvent
// están declarados en src/speech-recognition.d.ts y son visibles globalmente.

type SearchState = 'idle' | 'listening' | 'processing' | 'results' | 'error' | 'no-results';

@Component({
  selector: 'app-voice-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './voice-search.component.html',
  styleUrl: './voice-search.component.scss'
})
export class VoiceSearchComponent implements OnInit, OnDestroy {

  // ── Estado del componente ─────────────────────────────────────────────────
  state: SearchState = 'idle';
  transcript = '';
  textQuery = '';
  resultados: Producto[] = [];
  errorMessage = '';
  isSupported = true;

  // ── Speech Recognition ────────────────────────────────────────────────────
  // El tipo SpeechRecognition proviene de src/speech-recognition.d.ts
  private recognition: SpeechRecognition | null = null;
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();


  constructor(private tiendaService: TiendaService) {}

  ngOnInit(): void {
    this.initializeSpeechRecognition();
    this.setupSearchPipeline();
  }

  ngOnDestroy(): void {
    this.stopListening();
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Inicialización de la Web Speech API ──────────────────────────────────
  private initializeSpeechRecognition(): void {
    // Detección del constructor con soporte cross-browser (webkit para Chrome)
    const SpeechRecognitionCtor: (new () => SpeechRecognition) | undefined =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      this.isSupported = false;
      this.state = 'error';
      this.errorMessage = 'Tu navegador no soporta la Web Speech API. Usa Google Chrome.';
      return;
    }

    this.recognition = new SpeechRecognitionCtor();
    this.recognition.lang = 'es-PE';
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    // Resultado parcial en tiempo real
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      this.transcript = finalText || interimText;

      if (finalText) {
        this.onTranscriptFinal(finalText);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.state = 'error';
      const errores: Record<string, string> = {
        'not-allowed':   'Permiso de micrófono denegado. Habilítalo en tu navegador.',
        'no-speech':     'No se detectó voz. Inténtalo de nuevo.',
        'network':       'Error de red. Verifica tu conexión.',
        'audio-capture': 'No se encontró ningún micrófono.',
      };
      this.errorMessage = errores[event.error] ?? `Error: ${event.error}`;
    };

    this.recognition.onend = () => {
      if (this.state === 'listening') {
        this.state = 'idle';
      }
    };
  }


  // ── Pipeline de búsqueda con debounce ────────────────────────────────────
  private setupSearchPipeline(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(q => this.ejecutarBusqueda(q));
  }

  // ── Controles de usuario ─────────────────────────────────────────────────
  toggleListening(): void {
    if (!this.isSupported) return;

    if (this.state === 'listening') {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  private startListening(): void {
    this.state = 'listening';
    this.transcript = '';
    this.errorMessage = '';
    this.recognition?.start();
  }

  private stopListening(): void {
    this.recognition?.stop();
    this.state = this.resultados.length > 0 ? 'results' : 'idle';
  }

  onTextSearch(): void {
    const q = this.textQuery.trim();
    if (!q) return;
    this.transcript = q;
    this.searchSubject.next(q);
  }

  onTextKeyUp(): void {
    const q = this.textQuery.trim();
    if (q.length >= 2) {
      this.searchSubject.next(q);
    }
  }

  limpiar(): void {
    this.state = 'idle';
    this.transcript = '';
    this.textQuery = '';
    this.resultados = [];
    this.errorMessage = '';
  }

  // ── Búsqueda al backend ──────────────────────────────────────────────────
  private onTranscriptFinal(texto: string): void {
    const keyword = this.limpiarTexto(texto);
    this.textQuery = keyword;
    this.searchSubject.next(keyword);
  }

  private ejecutarBusqueda(q: string): void {
    if (!q) return;
    this.state = 'processing';

    this.tiendaService.buscarProductos(q).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (productos) => {
        this.resultados = productos;
        this.state = productos.length > 0 ? 'results' : 'no-results';
      },
      error: () => {
        this.state = 'error';
        this.errorMessage = 'Error al conectar con el servidor. Inténtalo más tarde.';
      }
    });
  }

  // ── Utilidades ────────────────────────────────────────────────────────────
  private limpiarTexto(texto: string): string {
    return texto.trim().toLowerCase()
      .replace(/[¿?¡!.,;:]/g, '')
      .replace(/\s+/g, ' ');
  }

  get isListening(): boolean { return this.state === 'listening'; }
  get isProcessing(): boolean { return this.state === 'processing'; }
  get hasResults(): boolean { return this.state === 'results'; }
  get hasNoResults(): boolean { return this.state === 'no-results'; }
  get hasError(): boolean { return this.state === 'error'; }

  formatPrecio(precio: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(precio);
  }
}
