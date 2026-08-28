// Title: 4 4s
// Author: Aron Lide (Aspartagcus)
// Video: https://www.youtube.com/watch?v=GCtThfRt4wY
// Source: https://tinyurl.com/yt5x6792

// Standard 9x9 sudoku (default rows/columns/boxes) plus:
//   - green line: adjacent digits must differ by at least 5 (German Whispers).
//   - purple line: each line's digits are a non-repeating consecutive run, in
//     any order (Renban).
// The payload is drawn on an 11x11 canvas whose outer ring (row/col 1 and 11)
// is a shaded, aesthetic-only border: "The gray line and any line segment
// going outside the grid are just for aesthetic purposes." All coordinates
// here are already shifted into the true 9x9 grid (payload row/col minus 1).
// A gray corner-to-corner diagonal line in the payload is the "gray line" the
// ruleset names and is omitted as pure decoration.

// Renban lines. Two of the drawn purple polylines near the grid centre share
// a cell (R5C3): a 3-cell polyline R3C3-R4C3-R5C3 and a 4-cell polyline
// R4C4-R5C3-R5C2-R6C2 (itself recorded twice, in two different cell orders,
// as one drawn shape). Reading these as two independent Renban lines that
// merely touch at R5C3 makes the puzzle unsatisfiable together with the
// green lines below; reading all of it as one continuous purple line -- the
// same fragmenting the green pinwheel arms show elsewhere in this puzzle --
// and taking one Renban over the combined 6-cell set is satisfiable, so that
// is the encoding used here.
const RENBAN_LINES = [
  ['R1C7', 'R1C8', 'R2C9', 'R3C9'],
  ['R7C1', 'R8C1', 'R9C2', 'R9C3'],
  ['R3C3', 'R4C3', 'R5C3', 'R4C4', 'R5C2', 'R6C2'],
];

// Whisper (green) lines, one per drawn polyline in the payload, clipped to
// the cells inside the true 9x9 grid (a cell in the shaded outer ring drops
// from the path; where that splits one drawn polyline into two runs that
// still touch the interior, both runs are kept). Several lines cross or
// share a single cell with another line by design (the "beautiful
// construction" pinwheel of short arms) -- sharing a cell is not sharing an
// edge, so nothing here double-encodes another line's pair.
const WHISPER_LINES = [
  ['R4C4', 'R3C5', 'R2C6', 'R3C6', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3',
   'R8C4', 'R7C5', 'R6C6', 'R5C6', 'R4C7', 'R4C8', 'R5C8', 'R6C7'],
  ['R5C8', 'R6C7', 'R6C6', 'R7C5', 'R6C4'],
  ['R7C9', 'R8C8', 'R9C7'],
  ['R9C6', 'R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9', 'R6C9'],
  ['R6C9', 'R7C9'],
  ['R3C3', 'R4C2', 'R4C1'],
  ['R5C1', 'R4C2', 'R3C2', 'R2C2', 'R1C2'],
  ['R2C2', 'R2C3', 'R1C3'],
  ['R1C5', 'R2C4', 'R3C3'],
];

return [
  new Shape('9x9'),

  new Given('R1C8', 4),
  new Given('R3C4', 4),
  new Given('R7C6', 4),
  new Given('R9C2', 4),

  ...RENBAN_LINES.map(cells => new Renban(...cells)),

  // German whisper default difference is 5; omit the leading argument per
  // convention (Whisper's constructor treats a non-numeric first argument as
  // a cell and defaults difference to 5).
  ...WHISPER_LINES.map(cells => new Whisper(...cells)),
];
