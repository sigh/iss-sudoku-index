// Title: Sudoku en rouge, jaune, bleu et noir
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=UrvJfgNLNDc
// Source: https://sudokupad.app/jkcqhkr4sh?setting-nogrid=1

// Rules encoded here:
//   - A digit 0-9 in each non-black cell; no repeat in a row or column. Rows
//     are 4, 4, 7 and then 8 cells long, so a digit may repeat down a column
//     of the drawing only where one of the two cells is black.
//   - Regions of the same colour (white, yellow, red, blue) have equal sums.
//   - Along each diagonal line the digits increase in one direction.
//   - The nine small square outlines hold different digits.
// Nothing is omitted.

// The board is a 10x8 canvas whose nine black cells are not playable, so the
// grid is Raw: no implicit constraints (a Sudoku grid would force its short
// rows and columns to be all-different across the black cells too).
const layout = [        // '#' = black, read off the artwork
  "###....#",
  "###....#",
  ".......#",
  "........",
  "........",
  "........",
  "........",
  "........",
  "........",
  "........",
];
const shape = new Shape("10x8", "0-9", "Raw");
const ref = cellGraph(shape);
const blackCells = new Set(ref.cells().filter(
  (_, i) => layout[Math.floor(i / 8)][i % 8] === "#"));
const at = spec => spec.trim().split(/\s+/);
const playableOnly = cells => cells.filter(cell => !blackCells.has(cell));

// Colour regions: the separately outlined blocks of each colour, transcribed
// from the painting. Region borders are the thick black rules; a colour's
// blocks are listed separately because the rule equates blocks, not colours.
const white = [
  "R1C4 R1C5",
  "R2C4 R2C5",
  "R3C1 R4C1",
  "R5C1 R6C1",
  "R4C8 R5C8 R6C8 R7C8",
  "R5C6 R5C7",
  "R6C6 R6C7",
  "R7C3 R8C3",
  "R7C4 R8C4 R9C4",
  "R7C7 R8C7",
  "R9C1 R9C2 R9C3",
  "R9C5 R9C6 R9C7 RaC5 RaC6 RaC7",
];
const yellow = [
  "R1C6 R1C7 R2C6 R2C7",
  "R3C6 R3C7 R4C6 R4C7",
  "RaC1 RaC2 RaC3 RaC4",
];
const red = [
  "R3C2 R3C3 R3C4 R3C5 R4C2 R4C3 R4C4 R4C5"
  + " R5C2 R5C3 R5C4 R5C5 R6C2 R6C3 R6C4 R6C5",
  "R8C8 R9C8 RaC8",
];
const blue = [
  "R7C1 R7C2 R8C1 R8C2",
  "R7C5 R7C6 R8C5 R8C6",
];

// The three pale diagonal strokes, transcribed from the painting: two long
// ones and the single step inside the lower yellow block, all drawn in the
// same pale grey with the same square end-caps.
const diagonals = [
  "R3C5 R4C4 R5C3 R6C2 R7C1",
  "R6C6 R7C5 R8C4 R9C3",
  "R4C6 R3C7",
];
// "increase in one direction" names no direction, so either orientation of the
// stroke may be the increasing one.
const eitherDirection = line => new Or([
  new Thermo(...line),
  new Thermo(...line.toReversed()),
]);

// Cells carrying a small square outline, transcribed from the painting.
const squares = "R1C4 R1C7 R2C5 R3C7 R4C1 R5C8 R6C5 RaC6 RaC8";

return [
  shape,
  // Black cells are not playable and appear in no rule; they are pinned to a
  // constant so the grid stays the full 10x8 board.
  ...[...blackCells].map(cell => new Given(cell, 0)),
  ...ref.rows().map(row => new AllDifferent(...playableOnly(row))),
  ...ref.columns().map(col => new AllDifferent(...playableOnly(col))),
  ...[white, yellow, red, blue].map(
    regions => new EqualSum(...regions.map(at))),
  ...diagonals.map(line => eitherDirection(at(line))),
  new AllDifferent(...at(squares)),
];
