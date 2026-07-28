// Title: Quetzalcoatl
// Author: aqjhs
// Video: https://www.youtube.com/watch?v=uc9joXnUbjY
// Source: https://sudokupad.app/ho057rtsy5

// Standard 9x9 Sudoku, anti-knight, green modular lines, and the drawn
// black, white, and green dots. Dot negatives do not apply.

// The paths transcribe the eight drawn green lines containing at least three cells.
const modularLines = [
  ['R2C9', 'R3C8', 'R2C7', 'R1C8', 'R2C8'],
  ['R3C7', 'R3C6', 'R4C5', 'R3C4', 'R3C5', 'R2C5', 'R2C4', 'R1C3'],
  ['R4C3', 'R5C4', 'R6C3', 'R5C3', 'R5C2', 'R6C2'],
  ['R7C2', 'R8C3', 'R9C2', 'R8C2', 'R8C1', 'R9C1'],
  ['R7C4', 'R6C5', 'R7C6', 'R7C5', 'R8C5', 'R8C6'],
  ['R9C7', 'R9C8', 'R9C9', 'R8C8', 'R8C9', 'R7C9'],
  ['R4C8', 'R5C8', 'R5C7', 'R4C7', 'R5C6', 'R6C7'],
  ['R3C3', 'R3C2', 'R2C1', 'R1C2', 'R2C3', 'R2C2'],
];

// These tables transcribe the drawn edge dots.
const blackDots = [
  ['R5C9', 'R6C9'],
  ['R4C9', 'R5C9'],
];
const whiteDots = [
  ['R5C1', 'R6C1'],
  ['R4C1', 'R5C1'],
  ['R1C5', 'R1C6'],
];
const greenDots = [
  ['R7C3', 'R7C4'],
  ['R7C6', 'R7C7'],
  ['R4C6', 'R4C7'],
];

// The custom pair predicate accepts digits with equal residues modulo 3.
const sameResidueKey = Pair.fnToKey((a, b) => (a - b) % 3 === 0, 9);

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...modularLines.map(cells => new Modular(3, ...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...greenDots.map(cells => new Pair(sameResidueKey, 'Same mod 3', ...cells)),
];
