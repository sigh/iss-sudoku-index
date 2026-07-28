// Title: A Night in the Entropics
// Author: Walking Writer
// Video: https://www.youtube.com/watch?v=wm01orhj0h0
// Source: https://sudokupad.app/510jy8hqjs

// Normal Sudoku. Black dots are 2:1, white dots are consecutive, and omitted
// dots carry no negative information. Kings cannot match; queen-diagonal 3s,
// 6s, and 9s cannot match. Peach lines are entropic, while three-cell peach
// lines contain exactly 3, 6, and 9.
const blackDots = [
  ['R3C4', 'R4C4'], ['R2C2', 'R2C3'], ['R4C9', 'R5C9'],
];
const whiteDots = [
  ['R8C1', 'R9C1'], ['R8C5', 'R9C5'], ['R7C6', 'R7C7'],
  ['R6C8', 'R7C8'], ['R4C8', 'R5C8'], ['R6C2', 'R6C3'],
  ['R1C2', 'R2C2'], ['R1C7', 'R2C7'],
];
// Peach-line paths transcribed from the drawing.
const longPeachLine = ['R5C2', 'R5C3', 'R4C4', 'R4C5', 'R4C6', 'R5C7', 'R5C8'];
const shortPeachLines = [
  ['R3C1', 'R3C2', 'R4C3'],
  ['R4C8', 'R4C9', 'R5C9'],
  ['R9C3', 'R8C3', 'R7C4'],
];
// Each same-slope diagonal is a queen's route; PairX checks every pair on it.
const queenDiagonals = [
  ...Array.from({ length: 8 }, (_, c) =>
    Array.from({ length: 9 - c }, (_, r) => makeCellId(r + 1, r + c + 1))),
  ...Array.from({ length: 7 }, (_, r) =>
    Array.from({ length: 8 - r }, (_, c) => makeCellId(r + c + 2, c + 1))),
  ...Array.from({ length: 8 }, (_, c) =>
    Array.from({ length: c + 2 }, (_, r) => makeCellId(r + 1, c - r + 2))),
  ...Array.from({ length: 7 }, (_, r) =>
    Array.from({ length: 8 - r }, (_, c) => makeCellId(r + c + 2, 9 - c))),
];
const antiQueen369 = Pair.fnToKey((a, b) => a !== b || ![3, 6, 9].includes(a), 9);

return [
  new Shape('9x9'),
  ...blackDots.map(pair => new BlackDot(...pair)),
  ...whiteDots.map(pair => new WhiteDot(...pair)),
  new AntiKing(),
  ...queenDiagonals.map(line => new PairX(antiQueen369, 'anti-queen 3/6/9', ...line)),
  new Entropic(...longPeachLine),
  ...shortPeachLines.flatMap(line => [
    new AllDifferent(...line),
    ...line.map(cell => new Given(cell, 3, 6, 9)),
  ]),
];
