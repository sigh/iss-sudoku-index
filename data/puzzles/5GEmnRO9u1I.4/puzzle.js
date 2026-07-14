// Title: Variant Lesson: German Whispers
// Author: Deckatron
// Video: https://www.youtube.com/watch?v=5GEmnRO9u1I
// Source: https://sudokupad.app/fgv90mbujn

// 6x6 grid, values 1-9: place 6 unique digits (an unknown subset of 1-9) so
// each digit appears 6 times and no digit repeats in a row, column, or 2x3
// box. Default box regions for a 6x6 shape are already 2x3, matching the
// drawn regions, so no explicit Jigsaw is needed.
const shape = new Shape('6x6~1-9');

// "Which 6 digits to use must be determined": tie a helper Var to the count
// of distinct values across the whole grid, and pin it to 6. Row/column/box
// all-different (6 cells each, over a 6-value alphabet) then forces every
// row, column, and box to be a permutation of that same 6-digit set.
const digitCount = new Var('D', 'digits used', 1);
const allCells = [];
for (let r = 1; r <= 6; r++)
  for (let c = 1; c <= 6; c++)
    allCells.push(makeCellId(r, c));

const digitsUsed = [
  digitCount,
  new Given(digitCount.cell(1), 6),
  new CountDistinct(digitCount.cell(1), ...allCells),
];

// German Whisper lines (adjacent cells differ by >= 5).
const whispers = [
  new Whisper(5, 'R1C1', 'R1C2', 'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R6C1'),
  new Whisper(5, 'R1C4', 'R1C5', 'R1C6'),
  new Whisper(5, 'R2C4', 'R2C5', 'R3C5', 'R4C5', 'R4C6'),
  new Whisper(5, 'R6C4', 'R6C5', 'R6C6'),
];

// Thermometer: bulb at R6C3, strictly increasing up column 3.
const thermo = new Thermo('R6C3', 'R5C3', 'R4C3', 'R3C3', 'R2C3', 'R1C3');

return [
  shape,
  ...digitsUsed,
  ...whispers,
  thermo,
];
