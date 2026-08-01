// Title: Pi Day 2024
// Author: Dr Logic
// Video: https://www.youtube.com/watch?v=kUj05UqIXek
// Source: https://app.crackingthecryptic.com/uzrndnwu5y

// Normal Sudoku rules apply. Encode the nine drawn killer cages, three black
// ratio dots (with no negative-dot rule), three grey thermometers, and the
// global anti-knight rule. The pink shading has no rule text assigning it a
// constraint.
// Drawn killer-cage cells and totals from the source payload.
const cages = [
  [14, 'R4C4', 'R5C4'],
  [15, 'R6C3', 'R7C3'],
  [9, 'R4C6', 'R5C6', 'R5C7'],
  [2, 'R6C8'],
  [6, 'R7C8'],
  [31, 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8'],
  [24, 'R1C7', 'R1C8', 'R1C9'],
  [3, 'R1C1', 'R1C2'],
  [14, 'R1C4', 'R1C5', 'R1C6'],
];

// Drawn thermometer paths, listed from bulb to tip.
const thermos = [
  ['R5C5', 'R4C5'],
  ['R6C6', 'R6C7'],
  ['R6C4', 'R6C3'],
];

// Drawn black-dot cell pairs.
const ratios = [
  ['R4C4', 'R4C3'],
  ['R4C7', 'R4C6'],
  ['R4C9', 'R3C9'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...thermos.map(cells => new Thermo(...cells)),
  ...ratios.map(cells => new BlackDot(...cells)),
  new AntiKnight(),
];
