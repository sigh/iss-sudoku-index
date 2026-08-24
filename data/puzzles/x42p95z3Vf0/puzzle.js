// Title: Valentine Sudoku
// Author: Rodolphe Lepigre
// Video: https://www.youtube.com/watch?v=x42p95z3Vf0
// Source: https://app.crackingthecryptic.com/sudoku/tmGJtPD44R

// Normal sudoku rules apply (default row/column/box all-different from Shape).
// Digits increase along thermometers from the bulb -- Thermo(...cells), bulb
// first. Black dots join cells with a 1:2 ratio -- BlackDot. White dots join
// cells with consecutive digits -- WhiteDot. "Not all dots are given" means
// the drawn dots are a positive list only: no StrictKropki/negative closure
// is encoded, so an unmarked adjacent pair may still be consecutive or a 1:2
// ratio.

// Thermometers: 6 drawn strokes, one of which (T4) is a bulb at R8C2 forking
// into three 1-cell arms. A circle overlay sits on the shared point R8C2,
// not on either drawn line entry's own listed endpoint, splitting one entry
// into two arms (R8C2->R7C3 and R8C2->R9C1) while the other entry supplies
// the third arm (R8C2->R7C1).
// Bulb identity for every other thermo is a light-grey circle overlay sitting
// on the first-listed cell, except T4 and T6 which are drawn tip-first (their
// own line entries note the LAST waypoint is the true bulb).
const thermos = [
  ['R1C1', 'R2C1', 'R3C1', 'R3C2', 'R3C3'],
  ['R1C4', 'R2C4', 'R3C4', 'R3C5', 'R3C6', 'R2C6', 'R1C6'],
  ['R1C7', 'R2C7', 'R3C8', 'R2C9', 'R1C9'],
  ['R8C2', 'R7C1'], // T4 arm 1
  ['R8C2', 'R7C3'], // T4 arm 2
  ['R8C2', 'R9C1'], // T4 arm 3
  ['R9C4', 'R9C5', 'R9C6', 'R8C6', 'R7C6', 'R7C5', 'R7C4', 'R8C4'],
  ['R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7', 'R8C7', 'R7C7'],
];

// Kropki dots, transcribed from the payload's overlay edge-center
// coordinates (each dot overlay's center sits on the midpoint of the two
// cells it joins).
const blackDots = [
  ['R8C2', 'R8C3'],
  ['R6C1', 'R7C1'],
  ['R5C3', 'R5C4'],
  ['R4C5', 'R5C5'],
  ['R4C8', 'R5C8'],
  ['R5C8', 'R6C8'],
];
const whiteDots = [
  ['R3C2', 'R4C2'],
  ['R4C4', 'R5C4'],
  ['R4C6', 'R5C6'],
  ['R5C6', 'R6C6'],
  ['R5C4', 'R6C4'],
  ['R4C1', 'R5C1'],
];

return [
  new Shape('9x9'),
  ...thermos.map((cells) => new Thermo(...cells)),
  ...blackDots.map((cells) => new BlackDot(...cells)),
  ...whiteDots.map((cells) => new WhiteDot(...cells)),
];
