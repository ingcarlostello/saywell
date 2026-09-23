import { HandwrittenNote } from './HandwrittenNote/HandwrittenNote';
import type { PronunciationHeroProps } from './PronunciationHero.types';
import { SoundWave } from './SoundWave/SoundWave';

// The title keeps the mockup's break ("Mejora tu pronunciación / en inglés") through its measure in `em`;
// 28 px on phones so the first line (≈ 11.1 em) also fits the 328 px a 360 px Android phone leaves. The
// artwork only fits next to the text on wide screens, and stays compact so the text keeps its measure.
export function PronunciationHero({ title, subtitle, note }: PronunciationHeroProps) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="min-w-0 flex-1">
        <h1 className="max-w-[11.5em] text-[1.75rem] leading-tight font-bold wrap-break-word sm:text-4xl lg:text-[2.5rem] xl:text-4xl">
          {title.before}
          <span className="bg-linear-to-r from-brand-text-from to-brand-text-to bg-clip-text text-transparent forced-colors:text-[CanvasText]">
            {title.highlight}
          </span>
          {title.after}
        </h1>
        <p className="mt-3 max-w-120 text-base text-muted-foreground sm:text-lg">{subtitle}</p>
      </div>
      <div className="hidden shrink-0 items-center gap-4 xl:flex">
        <SoundWave className="h-32 w-32" />
        <HandwrittenNote text={note} />
      </div>
    </div>
  );
}
