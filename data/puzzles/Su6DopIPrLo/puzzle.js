// Title: Magical Kingdom
// Author: Jonny Kaufman
// Video: https://www.youtube.com/watch?v=Su6DopIPrLo
// Source: https://cracking-the-cryptic.web.app/sudoku/HGN6gMR3pM

// Normal sudoku (standard 3x3 boxes, no givens). Seven thermometers: digits
// strictly increase from bulb to tip. No two cells a king's move apart share
// a digit (global Anti-King). The central 3x3 box (R4-R6,C4-C6) is a magic
// square: its 3 rows, 3 columns, and 2 three-cell diagonals all sum to the
// same total.
//
// Thermometer cell paths, bulb first. Two of the seven thermometers (A, B)
// are drawn as separate strokes, each with its own bulb, both ending in
// R1C5 -- so that cell is the shared tip of both thermometers. The red
// marker on R1C5 in the source art is decorative styling for that shared
// tip and adds no separate rule.
const thermoA = ['R2C1', 'R3C2', 'R4C3', 'R3C4', 'R2C4', 'R1C5'];
const thermoB = ['R2C9', 'R3C8', 'R4C7', 'R3C6', 'R2C6', 'R1C5'];
const thermoC = ['R5C6', 'R6C5', 'R5C4'];
const thermoD = ['R6C1', 'R5C1', 'R4C1', 'R3C1'];
const thermoE = ['R3C9', 'R4C9', 'R5C9', 'R6C9'];
const thermoF = ['R8C7', 'R8C8', 'R8C9'];
const thermoG = ['R8C1', 'R8C2', 'R8C3'];

const thermos = [thermoA, thermoB, thermoC, thermoD, thermoE, thermoF, thermoG]
  .map(cells => new Thermo(...cells));

// Central box's 3 rows, 3 columns, and 2 diagonals as magic-square segments.
const magicSquareSegments = [
  ['R4C4', 'R4C5', 'R4C6'],
  ['R5C4', 'R5C5', 'R5C6'],
  ['R6C4', 'R6C5', 'R6C6'],
  ['R4C4', 'R5C4', 'R6C4'],
  ['R4C5', 'R5C5', 'R6C5'],
  ['R4C6', 'R5C6', 'R6C6'],
  ['R4C4', 'R5C5', 'R6C6'],
  ['R4C6', 'R5C5', 'R6C4'],
];

return [
  new Shape('9x9'),
  ...thermos,
  new AntiKing(),
  new EqualSum(...magicSquareSegments),
];
