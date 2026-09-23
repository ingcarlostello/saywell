import { SPEECH, VOICE_LANG_SEPARATOR } from '../constants/speech.constants';

const toLangTag = (lang: string): string =>
  lang.replaceAll(VOICE_LANG_SEPARATOR.android, VOICE_LANG_SEPARATOR.bcp47).toLowerCase();

// American English only (a British voice would teach the wrong vowels); the platform's default voice wins
// when it is one of them.
export function pickEnUsVoice(voices: readonly SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const target = toLangTag(SPEECH.lang);
  const matches = voices.filter((voice) => toLangTag(voice.lang) === target);
  return matches.find((voice) => voice.default) ?? matches[0];
}
