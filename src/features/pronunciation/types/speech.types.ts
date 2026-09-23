// `canSpeak` is false without the Web Speech API or without an en-US voice: the Listen button is hidden.
export interface SpeechController {
  canSpeak: boolean;
  speak: (text: string) => void;
}
