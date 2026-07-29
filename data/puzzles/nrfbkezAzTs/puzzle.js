// Title: No RePEAts!
// Author: sujoyku
// Video: https://www.youtube.com/watch?v=nrfbkezAzTs
// Source: https://sudokupad.app/ww029llseg

// Normal Sudoku applies. The nine drawn circles hold 1-9 without repetition.
// Each drawn circle-to-circle Pea Line has intervening digits summing to either
// decimal ordering of its endpoint digits. Every circle splits a green stroke.
const circles = ['R1C1', 'R1C9', 'R2C4', 'R4C2', 'R6C6', 'R7C9', 'R8C1', 'R9C1', 'R9C7'];

function peaLine(a, b, ...middle) {
  return new Or([
    new Sum(0, ...middle, [a, -10], [b, -1]),
    new Sum(0, ...middle, [a, -1], [b, -10]),
  ]);
}

return [
  new Shape('9x9'),
  new AllDifferent(...circles),

  // Green stroke segments, transcribed from the circle-to-circle drawn paths.
  peaLine('R8C1', 'R4C2', 'R7C1', 'R7C2', 'R6C2', 'R6C3', 'R5C3', 'R4C3'),
  peaLine('R4C2', 'R1C1', 'R4C1', 'R3C1', 'R2C1'),
  peaLine('R1C1', 'R2C4', 'R1C2', 'R1C3', 'R1C4'),
  peaLine('R7C9', 'R6C6', 'R6C9', 'R6C8', 'R6C7'),
  peaLine('R6C6', 'R9C1', 'R7C5', 'R7C4', 'R8C4', 'R8C3', 'R9C3', 'R9C2'),
  peaLine('R9C1', 'R1C9', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8'),
  peaLine('R1C9', 'R6C6', 'R2C9', 'R3C9', 'R4C9', 'R4C8', 'R4C7', 'R5C7'),
  peaLine('R6C6', 'R9C7', 'R7C6', 'R8C6', 'R9C6'),
];
