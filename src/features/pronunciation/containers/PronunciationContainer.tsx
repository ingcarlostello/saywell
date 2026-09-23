import { LiveRegion } from '@/shared/ui';
import { ClearFieldButton } from '../components/ClearFieldButton/ClearFieldButton';
import { HistoryEmpty } from '../components/HistoryEmpty/HistoryEmpty';
import { HistoryList } from '../components/HistoryList/HistoryList';
import { HistoryPanel } from '../components/HistoryPanel/HistoryPanel';
import { HistoryToggleButton } from '../components/HistoryToggleButton/HistoryToggleButton';
import { ListenButton } from '../components/ListenButton/ListenButton';
import { PronunciationForm } from '../components/PronunciationForm/PronunciationForm';
import { PronunciationHero } from '../components/PronunciationHero/PronunciationHero';
import { PronunciationLayout } from '../components/PronunciationLayout/PronunciationLayout';
import { QueryField } from '../components/QueryField/QueryField';
import { RateLimitBar } from '../components/RateLimitBar/RateLimitBar';
import { ResultCard } from '../components/ResultCard/ResultCard';
import { ResultEmpty } from '../components/ResultEmpty/ResultEmpty';
import { ResultNotice } from '../components/ResultNotice/ResultNotice';
import { ResultSkeleton } from '../components/ResultSkeleton/ResultSkeleton';
import { RetryButton } from '../components/RetryButton/RetryButton';
import { SubmitButton } from '../components/SubmitButton/SubmitButton';
import { HISTORY_VIEW } from '../constants/history.constants';
import { RESULT_VIEW } from '../constants/pronunciation.constants';
import { usePronunciation } from '../hooks/usePronunciation';
import type { PronunciationContainerProps } from './PronunciationContainer.types';

// One facade call: the field is shared by the form and the history, the request by the form and the result.
// Conditional regions are resolved here with constants, and optional actions travel as slots.
export function PronunciationContainer({ aside }: PronunciationContainerProps) {
  const { hero, form, result, rateLimit, history, announcement } = usePronunciation();
  return (
    <>
      <PronunciationLayout
        hero={<PronunciationHero {...hero} />}
        form={
          <PronunciationForm
            onSubmit={form.onSubmit}
            field={
              <QueryField
                value={form.value}
                maxLength={form.maxLength}
                counter={form.counter}
                focusRequestId={form.focusRequestId}
                onValueChange={form.onValueChange}
                label={form.labels.field}
                placeholder={form.labels.placeholder}
                clearAction={form.canClear && <ClearFieldButton label={form.labels.clear} onClear={form.onClear} />}
              />
            }
            submit={
              <SubmitButton
                label={form.submitLabel}
                isSubmitting={form.isSubmitting}
                isDisabled={form.isSubmitDisabled}
                focusRequestId={form.submitFocusRequestId}
              />
            }
          />
        }
        result={
          <>
            {result.kind === RESULT_VIEW.idle && <ResultEmpty {...result.labels} />}
            {result.kind === RESULT_VIEW.loading && <ResultSkeleton />}
            {result.kind === RESULT_VIEW.ready && (
              <ResultCard card={result.card} listenAction={result.listen && <ListenButton {...result.listen} />} />
            )}
            {result.kind === RESULT_VIEW.notice && (
              <ResultNotice
                tone={result.tone}
                title={result.title}
                message={result.message}
                action={result.retry && <RetryButton {...result.retry} />}
              />
            )}
          </>
        }
        rateLimit={<RateLimitBar {...rateLimit} />}
        history={
          <HistoryPanel
            title={history.title}
            toggle={history.kind === HISTORY_VIEW.list && history.toggle && <HistoryToggleButton {...history.toggle} />}
          >
            {history.kind === HISTORY_VIEW.empty && <HistoryEmpty {...history.empty} />}
            {history.kind === HISTORY_VIEW.list && <HistoryList items={history.items} />}
          </HistoryPanel>
        }
        aside={aside}
      />
      <LiveRegion>{announcement}</LiveRegion>
    </>
  );
}
