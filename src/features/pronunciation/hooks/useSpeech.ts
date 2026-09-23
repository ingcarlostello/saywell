import { useEffect, useSyncExternalStore } from 'react';
import { DOM_EVENT } from '@/shared/constants/dom.constants';
import { SPEECH } from '../constants/speech.constants';
import { pickEnUsVoice } from '../helpers/speech.helper';
import type { SpeechController } from '../types/speech.types';

const isSpeechAvailable = (): boolean => 'speechSynthesis' in window;

// Chrome loads the voices asynchronously and announces them with `voiceschanged`; Safari has them at once.
function subscribeToVoices(onChange: () => void): () => void {
  if (!isSpeechAvailable()) return () => undefined;
  speechSynthesis.addEventListener(DOM_EVENT.voicesChanged, onChange);
  return () => speechSynthesis.removeEventListener(DOM_EVENT.voicesChanged, onChange);
}

const hasEnUsVoice = (): boolean => isSpeechAvailable() && pickEnUsVoice(speechSynthesis.getVoices()) !== undefined;

export function useSpeech(): SpeechController {
  const canSpeak = useSyncExternalStore(subscribeToVoices, hasEnUsVoice);

  // Nothing keeps talking once the page is hidden or the view goes away.
  useEffect(() => {
    if (!isSpeechAvailable()) return undefined;
    const stopWhenHidden = (): void => {
      if (document.hidden) speechSynthesis.cancel();
    };
    document.addEventListener(DOM_EVENT.visibilityChange, stopWhenHidden);
    return () => {
      document.removeEventListener(DOM_EVENT.visibilityChange, stopWhenHidden);
      speechSynthesis.cancel();
    };
  }, []);

  // Synchronous inside the click that calls it: iOS only starts speech from a user gesture.
  const speak = (text: string): void => {
    if (!isSpeechAvailable()) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH.lang;
    utterance.rate = SPEECH.rate;
    const voice = pickEnUsVoice(speechSynthesis.getVoices());
    if (voice) utterance.voice = voice;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  return { canSpeak, speak };
}
