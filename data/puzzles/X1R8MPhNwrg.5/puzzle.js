// Title: Oct 29, 2021: Thermo Quads
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=X1R8MPhNwrg
// Source: https://tinyurl.com/ru6hxppm

// Normal Sudoku. Four thermometers strictly increase from the bulb (first
// cell of each line, per the source payload's thermometer convention). Six
// white quadruple circles: each circle's four written digits must appear in
// the surrounding 2x2 block.

// Thermometers, transcribed from the four drawn lines, bulb-first.
const thermos = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'],
  ['R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9'],
  ['R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7'],
  ['R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
].map(cells => new Thermo(...cells));

// Quadruple circles, transcribed from the six drawn circles; each cell list
// is top-left, top-right, bottom-left, bottom-right, so its first cell is
// the Quad anchor.
const quads = [
  [['R3C4', 'R3C5', 'R4C4', 'R4C5'], [1, 2, 3, 4]],
  [['R6C5', 'R6C6', 'R7C5', 'R7C6'], [6, 7, 8, 9]],
  [['R4C7', 'R4C8', 'R5C7', 'R5C8'], [1, 2, 7, 8]],
  [['R5C2', 'R5C3', 'R6C2', 'R6C3'], [2, 3, 8, 9]],
  [['R3C1', 'R3C2', 'R4C1', 'R4C2'], [1, 4, 5, 9]],
  [['R6C8', 'R6C9', 'R7C8', 'R7C9'], [1, 5, 6, 9]],
].map(([[topLeftCell], values]) => new Quad(topLeftCell, ...values));

return [
  new Shape('9x9'),
  ...thermos,
  ...quads,
];
