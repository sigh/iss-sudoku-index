// Title: Murder by Numbers
// Author: Lil_Sis and Big_Bro
// Video: https://www.youtube.com/watch?v=CSwuLgHwCDI
// Source: https://sudokupad.app/nxzelh1c6v

// Doubling the outline equations avoids fractional coefficients: full cells have
// coefficient 2, bisected cells coefficient 1, and each displayed total is doubled.
const outlineSegments = [
  [54, ['R4C3', 'R5C3', 'R6C3'], ['R4C2', 'R5C1', 'R5C2', 'R6C1']],
  [32, ['R4C4', 'R4C5', 'R5C4', 'R6C4'], ['R4C6', 'R6C5']],
  [22, ['R7C3', 'R9C2'], ['R8C2', 'R8C3']],
  [34, ['R7C5'], ['R7C4', 'R8C4', 'R8C5']],
];

const bisectedCells = [...new Set(outlineSegments.flatMap(([, , half]) => half))];

const redDots = [
  ['R5C1', 'R6C1'],
  ['R7C3', 'R8C3'],
  ['R8C5', 'R8C6'],
  ['R4C6', 'R5C6'],
  ['R4C4', 'R5C4'],
];

const greenLines = [
  ['R2C8', 'R3C8', 'R3C7', 'R4C7'],
  ['R9C7', 'R9C8', 'R8C8', 'R8C9', 'R7C9'],
  ['R2C4', 'R2C5', 'R3C5', 'R3C6'],
];

const yellowPairs = [
  ['R2C1', 'R2C2'],
  ['R5C8', 'R5C9'],
  ['R7C7', 'R7C8'],
  ['R9C3', 'R9C4'],
];

// A left-to-right two-digit yellow number must lie in the alphabet range 10-26.
const alphabetPairKey = Pair.fnToKey((tens, ones) => 10 * tens + ones <= 26, 9);

return [
  new Shape('9x9'),

  ...outlineSegments.map(([total, full, half]) =>
    new Sum(total, ...full.map(cell => [cell, 2]), ...half)
  ),
  ...bisectedCells.map(cell => new Given(cell, 2, 4, 6, 8)),

  ...redDots.map(cells => new BlackDot(...cells)),
  ...greenLines.map(cells => new Whisper(5, ...cells)),
  ...yellowPairs.map(cells => new Pair(alphabetPairKey, '10-26', ...cells)),
];
