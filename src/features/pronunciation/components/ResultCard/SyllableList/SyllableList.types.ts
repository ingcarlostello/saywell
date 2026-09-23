import type { LangTag, SyllableView } from '@/features/pronunciation/types/pronunciation.types';

export interface SyllableListProps {
  title: string;
  stressedLabel: string;
  syllables: readonly SyllableView[];
  lang: LangTag;
}
