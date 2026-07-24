import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { TiendaService } from '../../servicios/tienda';
import { Producto } from '../../modelos/producto';

import { TiendaPerfilModalComponent } from '../tienda-perfil-modal/tienda-perfil-modal.component';

// Los tipos SpeechRecognition, SpeechRecognitionEvent y SpeechRecognitionErrorEvent
// están declarados en src/speech-recognition.d.ts y son visibles globalmente.

type SearchState = 'idle' | 'listening' | 'processing' | 'results' | 'error' | 'no-results';

@Component({
  selector: 'app-voice-search',
  standalone: true,
  imports: [CommonModule, FormsModule, TiendaPerfilModalComponent],
  templateUrl: './voice-search.component.html',
  styleUrl: './voice-search.component.scss'
})
export class VoiceSearchComponent implements OnInit, OnDestroy {
  // Estado del componente
  state: SearchState = 'idle';
  transcript = '';
  textQuery = '';
  resultados: Producto[] = [];
  todosLosProductos: Producto[] = [];
  mostrarTodasLasTiendas = false;
  tiendaIdSeleccionada: number | null = null;
  errorMessage = '';
  isSupported = true;
  sugerencias: string[] = ['Arroz', 'Leche', 'Aceite', 'Pan', 'Detergente', 'Gaseosa'];

  // Speech Recognition (Nativo / Fallback)
  private recognition: SpeechRecognition | null = null;
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Elementos de fallback
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioStream: MediaStream | null = null;
  private isNativeSupported = false;

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

  // Inicialización de la Web Speech API o Fallback
  private initializeSpeechRecognition(): void {
    const SpeechRecognitionCtor: (new () => SpeechRecognition) | undefined =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (SpeechRecognitionCtor) {
      this.isNativeSupported = true;
      this.recognition = new SpeechRecognitionCtor();
      this.recognition.lang = 'es-PE';
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

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

        const detected = (finalText || interimText).trim();
        if (detected) {
          this.transcript = detected;
        }

        if (finalText.trim()) {
          this.onTranscriptFinal(finalText.trim());
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
        if (this.transcript && this.transcript.trim()) {
          this.onTranscriptFinal(this.transcript.trim());
        } else if (this.state === 'listening') {
          this.state = 'idle';
        }
      };
    } else {
      this.isNativeSupported = false;
      const isMediaDevicesSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const isAudioContextSupported = !!(window.AudioContext || (window as any).webkitAudioContext);
      if (!isMediaDevicesSupported || !isAudioContextSupported) {
        this.isSupported = false;
        this.state = 'error';
        this.errorMessage = 'Tu navegador no soporta grabación de voz. Usa un navegador moderno.';
      }
    }
  }

  // Pipeline de búsqueda con debounce
  private setupSearchPipeline(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(q => this.ejecutarBusqueda(q));
  }

  isHolding = false;
  private justHeld = false;

  onPressStart(event: Event): void {
    if (!this.isSupported || this.isProcessing) return;
    this.isHolding = true;
    this.justHeld = true;
    if (this.state !== 'listening') {
      this.startListening();
    }
  }

  onPressEnd(event: Event): void {
    if (!this.isHolding) return;
    this.isHolding = false;
    if (this.state === 'listening') {
      this.stopListening();
    }
    setTimeout(() => { this.justHeld = false; }, 350);
  }

  // Controles de usuario
  toggleListening(event?: Event): void {
    if (this.justHeld) {
      return;
    }
    if (!this.isSupported || this.isProcessing) return;

    if (this.state === 'listening') {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  private startListening(): void {
    this.state = 'listening';
    this.transcript = '';
    this.textQuery = '';
    this.resultados = [];
    this.errorMessage = '';
    
    if (this.isNativeSupported) {
      try {
        this.recognition?.start();
      } catch (e) {
        // Ignorar si ya está escuchando
      }
    } else {
      this.startFallbackRecording();
    }
  }

  private stopListening(): void {
    if (this.isNativeSupported) {
      try {
        this.recognition?.stop();
      } catch (e) {}
      if (this.transcript && this.transcript.trim()) {
        this.onTranscriptFinal(this.transcript.trim());
      } else {
        this.state = 'idle';
      }
    } else {
      this.stopFallbackRecording();
    }
  }

  private async startFallbackRecording(): Promise<void> {
    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(this.audioStream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        this.state = 'processing';
        try {
          const rawBlob = new Blob(this.audioChunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' });
          const wavBlob = await this.convertToWav(rawBlob);
          this.tiendaService.transcribirAudio(wavBlob).subscribe({
            next: (res) => {
              if (res.text && res.text.trim()) {
                this.transcript = res.text.trim();
                this.onTranscriptFinal(res.text.trim());
              } else {
                this.state = 'no-results';
                this.errorMessage = 'No se detectó voz o no se pudo transcribir.';
              }
            },
            error: (err) => {
              this.state = 'error';
              this.errorMessage = 'Error al procesar audio en el servidor.';
              console.error(err);
            }
          });
        } catch (error) {
          this.state = 'error';
          this.errorMessage = 'Error al convertir el audio.';
          console.error(error);
        } finally {
          this.cleanupFallbackRecording();
        }
      };

      this.mediaRecorder.start();
    } catch (err: any) {
      this.state = 'error';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.errorMessage = 'Permiso de micrófono denegado. Habilítalo en tu navegador.';
      } else {
        this.errorMessage = 'No se encontró ningún micrófono o falló la captura.';
      }
      console.error(err);
    }
  }

  private stopFallbackRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  private cleanupFallbackRecording(): void {
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }
    this.mediaRecorder = null;
  }

  private async convertToWav(blob: Blob): Promise<Blob> {
    const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioContextCtor({ sampleRate: 16000 });
    
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    
    const numOfChan = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * 2 + 44; // mono
    const bufferArr = new ArrayBuffer(length);
    const view = new DataView(bufferArr);
    
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, length - 8, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, 16000, true);
    view.setUint32(28, 16000 * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, length - 44, true);
    
    const channelData = audioBuffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < channelData.length; i++) {
      let sample = Math.max(-1, Math.min(1, channelData[i]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, sample, true);
      offset += 2;
    }
    
    await audioCtx.close();
    return new Blob([bufferArr], { type: 'audio/wav' });
  }

  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  onTextSearch(): void {
    const q = this.textQuery.trim();
    if (!q) return;
    this.transcript = q;
    this.searchSubject.next(q);
  }

  buscarSugerencia(palabra: string): void {
    this.textQuery = palabra;
    this.onTextSearch();
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

  // Búsqueda al backend
  private onTranscriptFinal(texto: string): void {
    const keyword = this.limpiarTexto(texto);
    if (!keyword) return;
    this.textQuery = keyword;
    this.ejecutarBusqueda(keyword);
  }

  private ejecutarBusqueda(q: string): void {
    const query = q ? q.trim() : '';
    if (!query) return;
    this.state = 'processing';

    this.tiendaService.buscarProductos(query).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (productos) => {
        if (productos && productos.length > 0) {
          this.procesarRankingProductos(productos);
          this.state = 'results';
        } else {
          // Si la frase completa no devuelve resultados, probar con la última palabra principal (clave)
          const palabras = query.split(/\s+/);
          if (palabras.length > 1) {
            const palabraClave = palabras[palabras.length - 1];
            this.tiendaService.buscarProductos(palabraClave).subscribe({
              next: (resSub) => {
                if (resSub && resSub.length > 0) {
                  this.procesarRankingProductos(resSub);
                  this.state = 'results';
                } else {
                  this.resultados = [];
                  this.todosLosProductos = [];
                  this.state = 'no-results';
                }
              },
              error: () => {
                this.resultados = [];
                this.todosLosProductos = [];
                this.state = 'no-results';
              }
            });
          } else {
            this.resultados = [];
            this.todosLosProductos = [];
            this.state = 'no-results';
          }
        }
      },
      error: () => {
        this.state = 'error';
        this.errorMessage = 'Error al conectar con el servidor. Inténtalo más tarde.';
      }
    });
  }

  procesarRankingProductos(productos: Producto[]): void {
    this.todosLosProductos = productos;
    this.mostrarTodasLasTiendas = false;
    this.actualizarResultadosVisibles();
  }

  actualizarResultadosVisibles(): void {
    if (this.mostrarTodasLasTiendas) {
      this.resultados = [...this.todosLosProductos];
      return;
    }

    // Calcular el ranking de tiendas según el promedioValoracion
    const tiendasRating = new Map<number, number>();
    this.todosLosProductos.forEach(p => {
      if (p.tiendaId) {
        const rating = p.tiendaPromedioValoracion ?? 5.0;
        if (!tiendasRating.has(p.tiendaId) || rating > tiendasRating.get(p.tiendaId)!) {
          tiendasRating.set(p.tiendaId, rating);
        }
      }
    });

    // Ordenar tiendaIds por valoración descendente y seleccionar los Top 10
    const top10TiendaIds = new Set(
      Array.from(tiendasRating.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(e => e[0])
    );

    // Filtrar productos pertenecientes a las 10 mejores tiendas
    this.resultados = this.todosLosProductos.filter(p => p.tiendaId && top10TiendaIds.has(p.tiendaId));
  }

  verTodasLasTiendas(): void {
    this.mostrarTodasLasTiendas = true;
    this.actualizarResultadosVisibles();
  }

  abrirPerfilTienda(tiendaId?: number): void {
    if (tiendaId) {
      this.tiendaIdSeleccionada = tiendaId;
    }
  }

  cerrarPerfilTienda(): void {
    this.tiendaIdSeleccionada = null;
  }

  onValoracionEnviada(): void {
    if (this.textQuery) {
      this.ejecutarBusqueda(this.textQuery);
    }
  }

  // Utilidades
  private limpiarTexto(texto: string): string {
    const stopWords = new Set([
      'quiero', 'comprar', 'busco', 'buscar', 'dame', 'necesito', 'donde', 'hay',
      'tienen', 'quisiera', 'por', 'favor', 'el', 'la', 'los', 'las', 'un', 'una',
      'unos', 'unas', 'de', 'del', 'en', 'para', 'con', 'sin', 'me', 'nos'
    ]);

    const palabras = texto.trim().toLowerCase()
      .replace(/[¿?¡!.,;:]/g, '')
      .split(/\s+/)
      .filter(p => p.length > 0 && !stopWords.has(p));

    return palabras.length > 0 ? palabras.join(' ') : texto.trim().toLowerCase();
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
