// Title: Frozen Picnic
// Author: Ben Needham
// Video: https://www.youtube.com/watch?v=_jwR_vI35EA
// Source: https://cracking-the-cryptic.web.app/sudoku/HnhHFDgJBf

// Rules encoded here, in full:
//   - Normal sudoku: 1-9 once per row, column and 3x3 box. No given digits.
//   - Six grey lines, each with a filled round bulb on exactly one end (the
//     thermometer drawing). Digits do not decrease travelling from the bulb
//     along the line.
//   - Four outside numbers (12 above column 2, 29 above column 5, 0 left of
//     row 2, 2 left of row 5): sandwich sums, the digits between the 1 and the
//     9 of that row or column.
// Nothing is omitted; the payload draws nothing else.
//
// The source carries no rules text, so both readings rest on the drawing plus
// arithmetic. Bulb + plain line is the thermometer drawing and all six lines
// share it, but the strict reading cannot be what they mean: the large diamond
// below covers 16 cells, and 16 strictly increasing digits cannot come from a
// 1-9 range. The non-strict thermometer (`a <= b` along the line, ISS's "Slow
// Thermometer") is what the shapes can carry, so all six read that way.
// The four outside values choose the clue family the same way: a skyscraper
// count cannot be 12 or 29, and an X-sum or little-killer diagonal cannot be 0
// or 2, while sandwich sums admit all four.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Non-decreasing between consecutive cells, in bulb-to-tip list order.
const slowThermoKey = Pair.fnToKey((a, b) => a <= b, 9);
function SlowThermo(...cells) {
  return new Pair(slowThermoKey, 'Slow Thermo', ...cells);
}

// Transcribed from the payload's six drawn strokes, bulb cell first; the bulb
// is the end carrying the grey circle.
const thermos = [
  // Top-left and top-right corner strokes.
  SlowThermo('R1C4', 'R1C3', 'R2C2', 'R3C1'),
  SlowThermo('R3C9', 'R2C8', 'R1C7', 'R1C6'),
  // The large diamond: R1C5 -> R5C9 -> R9C5 -> R5C1 -> R2C4. It stops one cell
  // short of its bulb, so there is no wrap-around pair to add.
  SlowThermo(
    'R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C9', 'R6C8', 'R7C7', 'R8C6', 'R9C5',
    'R8C4', 'R7C3', 'R6C2', 'R5C1', 'R4C2', 'R3C3', 'R2C4'),
  // The small diamond: R3C5 -> R5C3 -> R7C5 -> R5C7 -> R4C6, likewise open.
  SlowThermo('R3C5', 'R4C4', 'R5C3', 'R6C4', 'R7C5', 'R6C6', 'R5C7', 'R4C6'),
  // Bottom-right and bottom-left corner strokes.
  SlowThermo('R9C7', 'R8C8', 'R7C9'),
  SlowThermo('R9C3', 'R8C2', 'R7C1'),
];

// Transcribed from the four text overlays in the margin: each sits beside a
// row or column, never at a corner, so each clues that straight lane.
const sandwiches = [
  Sandwich.fromCells(12, graph.column(2), geometry),
  Sandwich.fromCells(29, graph.column(5), geometry),
  Sandwich.fromCells(0, graph.row(2), geometry),
  Sandwich.fromCells(2, graph.row(5), geometry),
];

return [
  new Shape('9x9'),
  ...thermos,
  ...sandwiches,
];
