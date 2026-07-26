// Title: Peapods
// Author: sujoyku and ChinStrap
// Video: https://www.youtube.com/watch?v=-OyHrWYJU7g
// Source: https://sudokupad.app/cuf9l203ev

// Normal sudoku: 9x9, standard rows/columns/3x3 boxes (default Shape).
//
// Peapods: each green line has a white/green-bordered circle drawn on one of
// its own cells (an endpoint of the line). Per the rule text's worked example
// (2+4+5 = 11 = "1" repeated twice, with the circle holding 1 -- not one of
// 2/4/5), the circled cell's own digit is excluded from "the digits on the
// line" and is instead the digit that their sum must spell out twice. So for
// each line: sum(cells except the circled one) == 11 * value(circled cell).
// Encoded below as a coefficient Sum: the non-circled cells at coefficient 1,
// the circled cell at coefficient -11, total 0.

// Pod cell lists and circled cell, transcribed from the drawn line paths and
// circle positions (each circle sits on one endpoint of its line).
const PODS = [
  { cells: ['R1C6', 'R2C7', 'R1C8', 'R1C7'], circle: 'R1C6' },
  { cells: ['R4C9', 'R3C8', 'R2C9', 'R3C9'], circle: 'R4C9' },
  { cells: ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R3C6', 'R3C5'], circle: 'R1C9' },
  { cells: ['R4C5', 'R4C4', 'R4C3', 'R4C2'], circle: 'R4C2' },
  { cells: ['R4C1', 'R3C1', 'R3C2', 'R3C3', 'R3C4', 'R2C4', 'R2C5'], circle: 'R4C1' },
  { cells: ['R7C4', 'R6C4', 'R5C5', 'R5C4', 'R6C3', 'R6C2'], circle: 'R6C2' },
  { cells: ['R6C9', 'R7C9', 'R8C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R8C2', 'R7C1', 'R6C1'], circle: 'R6C9' },
  { cells: ['R5C7', 'R5C8', 'R6C7', 'R6C6', 'R7C7', 'R8C7', 'R8C6', 'R8C5', 'R8C4'], circle: 'R8C4' },
];

const peapods = PODS.map(({ cells, circle }) => new Sum(
  0,
  ...cells.filter(c => c !== circle),
  [circle, -11],
));

return [
  new Shape('9x9'),
  ...peapods,
];
