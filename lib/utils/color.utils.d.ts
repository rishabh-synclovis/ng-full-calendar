import { CalendarEventColor, CalendarNamedColor } from '../models/calendar-event.model';
export interface ResolvedEventColor {
    /** CSS class to apply, e.g. 'ngfc-color-blue', when the color is one of the 8 named presets. */
    className: string | null;
    /** Inline style overrides to apply when the color is a custom hex string (null for named colors, which rely on the class + theme CSS vars). */
    style: {
        background: string;
        borderColor: string;
        color: string;
    } | null;
}
export declare function isNamedColor(color: CalendarEventColor | undefined): color is CalendarNamedColor;
/** Resolves an event's `color` into either a theme CSS class (named colors) or inline hex-derived styles (custom colors). */
export declare function resolveEventColor(color: CalendarEventColor | undefined): ResolvedEventColor;
/** Resolves just the solid accent color (for small dots/indicators), matching resolveEventColor's border color. */
export declare function resolveEventDotColor(color: CalendarEventColor | undefined): {
    className: string | null;
    style: {
        backgroundColor: string;
    } | null;
};
