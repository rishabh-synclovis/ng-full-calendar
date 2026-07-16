import { CalendarEventColor, CalendarNamedColor } from '../models/calendar-event.model';

const NAMED_COLORS: ReadonlySet<string> = new Set<CalendarNamedColor>([
  'blue',
  'green',
  'red',
  'yellow',
  'purple',
  'orange',
  'teal',
  'gray',
]);

export interface ResolvedEventColor {
  /** CSS class to apply, e.g. 'ngfc-color-blue', when the color is one of the 8 named presets. */
  className: string | null;
  /** Inline style overrides to apply when the color is a custom hex string (null for named colors, which rely on the class + theme CSS vars). */
  style: { background: string; borderColor: string; color: string } | null;
}

export function isNamedColor(color: CalendarEventColor | undefined): color is CalendarNamedColor {
  return !!color && NAMED_COLORS.has(color);
}

/** Resolves an event's `color` into either a theme CSS class (named colors) or inline hex-derived styles (custom colors). */
export function resolveEventColor(color: CalendarEventColor | undefined): ResolvedEventColor {
  if (!color || isNamedColor(color)) {
    return { className: `ngfc-color-${color || 'blue'}`, style: null };
  }

  const rgb = parseHexColor(color);
  if (!rgb) {
    // Not a recognized hex string either — fall back to the default named color.
    return { className: 'ngfc-color-blue', style: null };
  }

  return {
    className: null,
    style: {
      background: tint(rgb, 0.85),
      borderColor: color,
      color: shade(rgb, 0.45),
    },
  };
}

/** Resolves just the solid accent color (for small dots/indicators), matching resolveEventColor's border color. */
export function resolveEventDotColor(color: CalendarEventColor | undefined): { className: string | null; style: { backgroundColor: string } | null } {
  if (!color || isNamedColor(color)) {
    return { className: `ngfc-color-${color || 'blue'}`, style: null };
  }
  const rgb = parseHexColor(color);
  return rgb ? { className: null, style: { backgroundColor: color } } : { className: 'ngfc-color-blue', style: null };
}

function parseHexColor(input: string): { r: number; g: number; b: number } | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(input.trim());
  if (!match) {
    return null;
  }
  let hex = match[1];
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(hex, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

/** Blends a color toward white by `amount` (0-1) to produce a pastel background tint. */
function tint(rgb: { r: number; g: number; b: number }, amount: number): string {
  const r = Math.round(rgb.r + (255 - rgb.r) * amount);
  const g = Math.round(rgb.g + (255 - rgb.g) * amount);
  const b = Math.round(rgb.b + (255 - rgb.b) * amount);
  return `rgb(${r}, ${g}, ${b})`;
}

/** Blends a color toward black by `amount` (0-1) to produce a darker, readable text shade. */
function shade(rgb: { r: number; g: number; b: number }, amount: number): string {
  const r = Math.round(rgb.r * (1 - amount));
  const g = Math.round(rgb.g * (1 - amount));
  const b = Math.round(rgb.b * (1 - amount));
  return `rgb(${r}, ${g}, ${b})`;
}
