// Title: Unknown Little Killers
// Author: GBPack
// Video: https://www.youtube.com/watch?v=l99jidj4yyA
// Source: https://sudokupad.app/hBHD7HmFpm

// Digits 1-6 occur once per row, column, and drawn six-cell jigsaw region.
// Each diagonal sum is the displayed one- or two-digit decimal clue; ? is an
// independent decimal digit, and a two-digit clue cannot begin with zero.
const regions = [
  ['R1C1', 'R2C1', 'R2C2', 'R3C1', 'R4C1', 'R5C1'],
  ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C6'],
  ['R2C3', 'R2C4', 'R3C4', 'R4C4', 'R4C5', 'R5C4'],
  ['R2C5', 'R3C5', 'R3C6', 'R4C6', 'R5C6', 'R6C6'],
  ['R3C2', 'R3C3', 'R4C2', 'R4C3', 'R5C2', 'R5C3'],
  ['R5C5', 'R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5'],
];

// Hand-transcribed from the four drawn diagonal arrows and their ?/?? labels.
const oneDigitClue = cells => new Or(
  Array.from({ length: 9 }, (_, i) => new Sum(i + 1, ...cells))
);

const twoDigitClue = cells => new Or(
  Array.from({ length: 12 }, (_, i) => new Sum(i + 10, ...cells))
);

return [
  new Shape('6x6'),
  new NoBoxes(),
  ...regions.map(cells => new AllDifferent(...cells)),
  oneDigitClue(['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6']),
  twoDigitClue(['R5C1', 'R6C2']),
  oneDigitClue(['R3C6', 'R2C5', 'R1C4']),
  oneDigitClue(['R6C4', 'R5C5', 'R4C6']),
];
