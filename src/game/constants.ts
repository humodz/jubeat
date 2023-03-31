export const CANVAS_SIZE = 1000;
export const BUTTON_SIZE = CANVAS_SIZE / 4;
export const GRID_ROWS = 4;
export const GRID_COLS = 4;

export const BUTTON_OUTLINE_THICKNESS = 0.05 * BUTTON_SIZE;
export const BUTTON_OUTLINE_COLOR = 0x3399ff;

export const TOUCH_MARKER_RADIUS = 0.05 * CANVAS_SIZE;
export const TOUCH_MARKER_COLOR = 0xffffff;
export const TOUCH_MARKER_ALPHA = 0.5;

export const MARKER_DURATION_MS = 800;
export const MARKER_JUDGEMENT_DURATION_MS = 500;

const markerDurationSecs = MARKER_DURATION_MS / 1000;
export const MARKER_DELAY_SECS = (markerDurationSecs / 25) * 15;
