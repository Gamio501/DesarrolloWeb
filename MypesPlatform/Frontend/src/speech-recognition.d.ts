/**
 * Declaraciones de tipos para la Web Speech API (SpeechRecognition).
 *
 * La Web Speech API no forma parte del estándar DOM que incluye TypeScript
 * por defecto en proyectos Angular cuando "types": [] está definido en
 * tsconfig.app.json, por lo que debemos declarar los tipos manualmente.
 *
 * Especificación: https://wicg.github.io/speech-api/
 */

// ── Tipos de resultado ───────────────────────────────────────────────────────

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

// ── Tipos de evento ──────────────────────────────────────────────────────────

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
  readonly interpretation: unknown;
  readonly emma: Document | null;
}

type SpeechRecognitionErrorCode =
  | 'no-speech'
  | 'aborted'
  | 'audio-capture'
  | 'network'
  | 'not-allowed'
  | 'service-not-allowed'
  | 'bad-grammar'
  | 'language-not-supported';

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: SpeechRecognitionErrorCode;
  readonly message: string;
}

// ── Interfaz principal SpeechRecognition ─────────────────────────────────────

interface SpeechGrammar {
  src: string;
  weight: number;
}

interface SpeechGrammarList {
  readonly length: number;
  addFromString(string: string, weight?: number): void;
  addFromURI(src: string, weight?: number): void;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
}

interface SpeechRecognition extends EventTarget {
  // Configuración
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;

  // Métodos
  abort(): void;
  start(): void;
  stop(): void;

  // Manejadores de eventos
  onaudioend:   ((this: SpeechRecognition, ev: Event) => void) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend:        ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror:      ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onnomatch:    ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onresult:     ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onsoundend:   ((this: SpeechRecognition, ev: Event) => void) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechend:  ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechstart:((this: SpeechRecognition, ev: Event) => void) | null;
  onstart:      ((this: SpeechRecognition, ev: Event) => void) | null;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

// ── Extensión de Window ──────────────────────────────────────────────────────
// Se declara la extensión de Window con los prefijos necesarios para
// compatibilidad con navegadores (Chrome usa webkitSpeechRecognition).

interface Window {
  SpeechRecognition:        typeof SpeechRecognition | undefined;
  webkitSpeechRecognition:  typeof SpeechRecognition | undefined;
}
