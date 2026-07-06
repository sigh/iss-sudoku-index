// Stishovite by bellsita and Wisteria Fall (supervised by XeonRisq)
// https://sudokupad.app/sxsm_bellsitaandWisteriaF_c0b9808b6466534244a61e9e2fc83dd2
// https://www.youtube.com/watch?v=a79ewtzPrrY
//
// Normal sudoku. No digit may repeat across all clues of a particular type.
// Green = German whisper (adjacent diff >= 5). Purple = Renban (consecutive set).
// Teal = every 3 adjacent cells are a complete mod-3 residue set. Red = digits
// alternate odd/even. Cages = all different. Grey circle = odd, grey squares = even.
// Black dot = 2:1 ratio. White dot = consecutive.

const greenLines = [
  ['R1C2', 'R2C2', 'R2C1', 'R1C1'],
  ['R1C8', 'R2C8', 'R2C9', 'R1C9'],
];

const purpleLines = [
  ['R3C1', 'R3C2', 'R4C2'],
  ['R4C3', 'R3C3', 'R3C4'],
  ['R2C4', 'R2C3', 'R1C3'],
];

const tealLines = [
  ['R4C7', 'R3C7', 'R3C6'],
  ['R4C8', 'R3C8', 'R3C9'],
  ['R2C6', 'R2C7', 'R1C7'],
];

const redLines = [
  ['R7C1', 'R7C2', 'R6C2'],
  ['R6C3', 'R7C3', 'R7C4'],
  ['R8C4', 'R8C3', 'R9C3'],
];

const cages = [
  ['R8C6', 'R8C7', 'R9C7'],
  ['R6C7', 'R7C6', 'R7C7'],
  ['R6C8', 'R7C8', 'R7C9'],
];

const oddCells = ['R4C5'];
const evenCells = ['R8C2', 'R8C8', 'R6C4', 'R6C6'];

const parityKey = Pair.fnToKey((a, b) => a % 2 !== b % 2, 9);

const constraints = [
  new Shape('9x9'),

  ...greenLines.map(cells => new Whisper(5, ...cells)),
  ...purpleLines.map(cells => new Renban(...cells)),
  ...tealLines.map(cells => new Modular(3, ...cells)),
  ...redLines.map(cells => new Pair(parityKey, '', ...cells)),
  ...cages.map(cells => new AllDifferent(...cells)),

  ...oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
  ...evenCells.map(cell => new Given(cell, 2, 4, 6, 8)),

  new BlackDot('R5C4', 'R6C4'),
  new WhiteDot('R6C5', 'R7C5'),

  // No digit repeats across all clues of a particular type.
  new AllDifferent(...greenLines.flat()),
  new AllDifferent(...purpleLines.flat()),
  new AllDifferent(...tealLines.flat()),
  new AllDifferent(...redLines.flat()),
  new AllDifferent(...cages.flat()),
  new AllDifferent(...oddCells, ...evenCells),
];

return constraints;
