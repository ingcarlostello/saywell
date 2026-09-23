import { LANG_TAGS } from '@/shared/constants/i18n.constants';
import { interpolate } from '@/shared/utils/i18n.utils';
import {
  HISTORY_DATE_FORMAT,
  HISTORY_DATE_WITH_YEAR_FORMAT,
  HISTORY_LIMITS,
  HISTORY_TIME_FORMAT,
  MS_PER_DAY,
} from '../constants/history.constants';
import { INPUT_LIMITS } from '../constants/pronunciation.constants';
import type { Lang } from '@/shared/types/i18n.types';
import type {
  HistoryDateFormatter,
  HistoryEntry,
  HistoryItemData,
  HistoryItemsContext,
} from '../types/history.types';
import { normalizeWord } from './pronunciation.helper';

// Case-insensitive: "Delivered" and "delivered" are the same entry. Unique both when a word is added and
// when the stored list is loaded, so it is also the stable React key (anti-pattern #5).
const toHistoryKey = (word: string): string => word.toLowerCase();

// ── Persisted values arrive unvalidated (§12.6 #4); the store never validates ───────────────────────────

// `Date.now()` is never negative, and a finite number outside the Date range (1e16) would make
// Intl.DateTimeFormat#format throw RangeError during render.
const isValidTimestamp = (timestamp: number): boolean => timestamp >= 0 && !Number.isNaN(new Date(timestamp).getTime());

// Only what the single writer can store: a normalized, non-empty word within the input limit.
function isHistoryEntry(value: unknown): value is HistoryEntry {
  return (
    typeof value === 'object' &&
    value !== null &&
    'word' in value &&
    typeof value.word === 'string' &&
    value.word.length > 0 &&
    value.word.length <= INPUT_LIMITS.maxLength &&
    normalizeWord(value.word) === value.word &&
    'askedAt' in value &&
    typeof value.askedAt === 'number' &&
    isValidTimestamp(value.askedAt)
  );
}

// Rebuilt with the same rule `add` uses: from the oldest entry to the newest, each goes first, so the order
// survives, the newest copy of a word wins and the list never exceeds 20.
export function toSupportedHistory(value: unknown): HistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isHistoryEntry).reduceRight<HistoryEntry[]>((list, entry) => addHistoryEntry(list, entry), []);
}

// ── Rules ────────────────────────────────────────────────────────────────────────────────────────────────

// The new entry goes first, replacing an older one of the same word; the list never exceeds 20.
export function addHistoryEntry(entries: readonly HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  const key = toHistoryKey(entry.word);
  return [entry, ...entries.filter((item) => toHistoryKey(item.word) !== key)].slice(0, HISTORY_LIMITS.max);
}

export function canToggleHistory(entries: readonly HistoryEntry[]): boolean {
  return entries.length > HISTORY_LIMITS.preview;
}

export function toHistoryItems(entries: readonly HistoryEntry[], context: HistoryItemsContext): HistoryItemData[] {
  const visible = context.isExpanded ? entries : entries.slice(0, HISTORY_LIMITS.preview);
  const currentKey = context.currentWord === undefined ? undefined : toHistoryKey(context.currentWord);
  const formatDate = createDateFormatter(context.lang);
  return visible.map((entry) => ({
    id: toHistoryKey(entry.word),
    word: entry.word,
    timeLabel: formatHistoryTime(entry.askedAt, context, formatDate),
    isActive: toHistoryKey(entry.word) === currentKey,
  }));
}

// The list is rebuilt on every keystroke and every tick, and building an Intl.DateTimeFormat is what that
// costs: one per format per call, created only when an entry needs it, instead of one or two per entry.
function createDateFormatter(lang: Lang): HistoryDateFormatter {
  const formatters = new Map<Intl.DateTimeFormatOptions, Intl.DateTimeFormat>();
  return (timestamp, options) => {
    const formatter = formatters.get(options) ?? new Intl.DateTimeFormat(LANG_TAGS[lang], options);
    formatters.set(options, formatter);
    return formatter.format(timestamp);
  };
}

// "Hoy, 12:34 p. m." / "Today, 12:34 PM"; older than yesterday shows the date.
function formatHistoryTime(askedAt: number, context: HistoryItemsContext, formatDate: HistoryDateFormatter): string {
  const time = formatDate(askedAt, HISTORY_TIME_FORMAT);
  return interpolate(context.texts.timeLabel, { day: toDayLabel(askedAt, context, formatDate), time });
}

// Local calendar days and years. A timestamp from the future (the clock moved back) still reads as today.
function toDayLabel(askedAt: number, { now, texts }: HistoryItemsContext, formatDate: HistoryDateFormatter): string {
  const days = Math.round((startOfDay(now) - startOfDay(askedAt)) / MS_PER_DAY);
  if (days <= 0) return texts.today;
  if (days === 1) return texts.yesterday;
  const sameYear = new Date(askedAt).getFullYear() === new Date(now).getFullYear();
  return formatDate(askedAt, sameYear ? HISTORY_DATE_FORMAT : HISTORY_DATE_WITH_YEAR_FORMAT);
}

// Rounding the difference absorbs the 23/25-hour days of a DST change.
const startOfDay = (timestamp: number): number => new Date(timestamp).setHours(0, 0, 0, 0);
