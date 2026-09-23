import { toSupportedLang } from '@/shared/utils/i18n.utils';
import { useUiStore } from '@/store';
import { INPUT_LIMITS, PRONUNCIATION_TEXTS, REQUEST_STATUS, RESULT_STATUS } from '../constants/pronunciation.constants';
import { RATE_LIMIT_TEXTS, RATE_LIMIT_TICK_MS } from '../constants/rateLimit.constants';
import {
  canSubmitWord,
  normalizeWord,
  toAnnouncement,
  toAnswerQuotaNote,
  toContentLang,
  toCounterView,
  toLastWord,
  toResultView,
  toSubmitLabel,
} from '../helpers/pronunciation.helper';
import type { PronunciationFacade, PronunciationResponse } from '../types/pronunciation.types';
import { useFocusRequest } from './useFocusRequest';
import { useHistory } from './useHistory';
import { useNow } from './useNow';
import { usePronunciationInput } from './usePronunciationInput';
import { usePronunciationRequest } from './usePronunciationRequest';
import { useRateLimit } from './useRateLimit';
import { useSpeech } from './useSpeech';

// FACADE: the only door from the UI to the pronunciation state. Every `on*` is a closure built here.
export function usePronunciation(): PronunciationFacade {
  const lang = toSupportedLang(useUiStore((s) => s.lang));
  const texts = PRONUNCIATION_TEXTS[lang];
  const now = useNow(RATE_LIMIT_TICK_MS);
  const input = usePronunciationInput();
  const request = usePronunciationRequest();
  const rateLimit = useRateLimit({ now, lang });
  const speech = useSpeech();
  const submitFocus = useFocusRequest();
  const lastWord = toLastWord(request.state);
  const history = useHistory({ now, lang, currentWord: lastWord, selectWord: input.fill });

  const isSubmitting = request.state.status === REQUEST_STATUS.loading;
  // aria-disabled keeps the button focusable, so the guard lives here and not only in the markup.
  const isSubmitDisabled = isSubmitting || rateLimit.isBlocked || !canSubmitWord(input.value);

  // Both `ok` and `out_of_scope` spend quota and refresh the snapshot; only `ok` enters the history.
  const saveAnswer = (response: PronunciationResponse): void => {
    rateLimit.record(response.rateLimit);
    if (response.result.status === RESULT_STATUS.ok) history.add(response.result.word);
  };
  const submitWord = (word: string): void => {
    const { ensureClientId: getClientId, markExhausted: saveRateLimited } = rateLimit;
    void request.send({ word, lang, getClientId, saveAnswer, saveRateLimited });
  };

  const result = toResultView(request.state, {
    texts,
    cardTexts: PRONUNCIATION_TEXTS[toContentLang(request.state) ?? lang].result,
    rateLimit: rateLimit.status,
    listen:
      lastWord !== undefined && speech.canSpeak
        ? { label: texts.result.listen, onListen: () => speech.speak(lastWord) }
        : undefined,
    // The Retry button usually unmounts with its notice: the submit button, which stays, rescues the focus.
    onRetry: () => {
      if (lastWord === undefined || rateLimit.isBlocked) return;
      submitWord(lastWord);
      submitFocus.request();
    },
  });

  return {
    hero: texts.hero,
    form: {
      value: input.value,
      maxLength: INPUT_LIMITS.maxLength,
      counter: toCounterView(input.value.length, texts.form),
      submitLabel: toSubmitLabel(rateLimit.status, texts.form),
      isSubmitting,
      isSubmitDisabled,
      canClear: input.value.length > 0,
      focusRequestId: input.focusRequestId,
      submitFocusRequestId: submitFocus.id,
      labels: { field: texts.form.field, placeholder: texts.form.placeholder, clear: texts.form.clear },
      onValueChange: input.setValue,
      onSubmit: () => {
        if (!isSubmitDisabled) submitWord(normalizeWord(input.value));
      },
      onClear: input.clear,
    },
    result,
    rateLimit: rateLimit.view,
    history: history.view,
    announcement: toAnnouncement(result, texts.result, toAnswerQuotaNote(request.state, lang, RATE_LIMIT_TEXTS[lang])),
  };
}
