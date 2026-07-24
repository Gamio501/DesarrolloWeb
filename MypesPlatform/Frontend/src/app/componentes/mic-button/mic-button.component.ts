import {
  Component,
  EventEmitter,
  OnDestroy,
  Output,
  signal,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { TiendaService } from '../../servicios/tienda';

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
  private isNativeSupported = false;

  // Elementos de fallback
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioStream: MediaStream | null = null;

  constructor(private tiendaService: TiendaService) {
    this.supported = this.detectSupport();
  }

  // Detección de soporte
  private detectSupport(): boolean {
    const hasNative = !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);
    const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasAudioContext = !!(window.AudioContext || (window as any).webkitAudioContext);
    
    this.isNativeSupported = hasNative;
    return hasNative || (hasMediaDevices && hasAudioContext);
  }

  private isHolding = false;
  private justHeld = false;

  onPressStart(event: Event): void {
    if (!this.supported) return;
    this.isHolding = true;
    this.justHeld = true;
    if (this.state() !== 'listening') {
      this.start();
    }
  }

  onPressEnd(event: Event): void {
    if (!this.isHolding) return;
    this.isHolding = false;
    if (this.state() === 'listening') {
      this.stop();
    }
    setTimeout(() => { this.justHeld = false; }, 350);
  }

  // Toggle micrófono
  toggle(): void {
    if (this.justHeld) {
      return;
    }
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
    this.state.set('listening');
    this.tooltip.set('Escuchando… Haz clic para detener');

    if (this.isNativeSupported) {
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
    } else {
      this.startFallbackRecording();
    }
  }

  private stop(): void {
    if (this.isNativeSupported) {
      this.recognition?.stop();
      this.state.set('idle');
      this.tooltip.set('Buscar por voz');
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
        this.state.set('idle');
        this.tooltip.set('Procesando voz...');
        try {
          const rawBlob = new Blob(this.audioChunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' });
          const wavBlob = await this.convertToWav(rawBlob);
          this.tiendaService.transcribirAudio(wavBlob).subscribe({
            next: (res) => {
              if (res.text && res.text.trim()) {
                this.voiceText.emit(res.text.trim());
              } else {
                this.tooltip.set('No se detectó voz.');
              }
              this.tooltip.set('Buscar por voz');
            },
            error: (err) => {
              this.state.set('error');
              this.tooltip.set('Error en servidor.');
              console.error(err);
              setTimeout(() => {
                this.state.set('idle');
                this.tooltip.set('Buscar por voz');
              }, 3000);
            }
          });
        } catch (error) {
          this.state.set('error');
          this.tooltip.set('Error de audio.');
          console.error(error);
          setTimeout(() => {
            this.state.set('idle');
            this.tooltip.set('Buscar por voz');
          }, 3000);
        } finally {
          this.cleanupFallbackRecording();
        }
      };

      this.mediaRecorder.start();
    } catch (err: any) {
      this.state.set('error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.tooltip.set('Permiso denegado.');
      } else {
        this.tooltip.set('Micrófono no encontrado.');
      }
      console.error(err);
      setTimeout(() => {
        this.state.set('idle');
        this.tooltip.set('Buscar por voz');
      }, 3000);
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

  ngOnDestroy(): void {
    this.recognition?.abort();
    this.cleanupFallbackRecording();
  }

  get isListening(): boolean { return this.state() === 'listening'; }
  get isError(): boolean     { return this.state() === 'error'; }
}
