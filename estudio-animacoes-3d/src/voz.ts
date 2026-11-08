// Tempos reais (início, fim) de cada palavra da narração, na mesma ordem das palavras de LINES (timeline.ts).
// Vazio = sem voz: a timeline estima os tempos pelo tamanho das palavras.
// Gere a partir da transcrição com tempos por palavra (ex.: ElevenLabs Scribe), ignorando tags como [excited].
export const VOZ: [number, number][] = [];
