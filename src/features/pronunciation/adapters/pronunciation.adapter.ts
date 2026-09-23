import { RESULT_STATUS } from '../constants/pronunciation.constants';
import type {
  PronounceRequestDto,
  PronunciationInput,
  PronunciationResult,
  PronunciationResultDto,
} from '../types/pronunciation.types';

// `clientId` is dropped here: it identifies the device and travels as a header, not in the body.
export function toPronounceRequestDto(input: PronunciationInput): PronounceRequestDto {
  return { word: input.word, lang: input.lang };
}

// The word shown is always the normalized input, never the echo in the response, and it is attached to the
// out-of-scope branch too, which the server sends without any payload.
export function toPronunciationResult(dto: PronunciationResultDto, word: string): PronunciationResult {
  if (dto.status === RESULT_STATUS.outOfScope) return { status: dto.status, word };
  return { status: dto.status, word, phonetic: dto.phonetic, parts: dto.parts, example: dto.example };
}
