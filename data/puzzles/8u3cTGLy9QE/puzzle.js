// Title: Six Rules Four Clues
// Author: 99%Sneaky
// Video: https://www.youtube.com/watch?v=8u3cTGLy9QE
// Source: https://sudokupad.app/wdzu2e0qne

// Rules encoded: standard 9x9 Sudoku; anti-knight; the grey thermometer
// increases from its R2C1 bulb to both tips; each arrow arm sums to its R4C6
// circle; the 30 cage is distinct; and box-border-separated blue-line segments
// have equal sums.
return [
  new Shape('9x9'),
  new AntiKnight(),

  // The drawn fork is represented by its two bulb-to-tip paths.
  new Thermo('R2C1', 'R3C1', 'R4C1', 'R4C2', 'R4C3', 'R4C4'),
  new Thermo('R2C1', 'R3C1', 'R4C1', 'R4C2', 'R3C2'),

  new Arrow('R4C6', 'R3C6', 'R2C6', 'R1C6'),
  new Arrow('R4C6', 'R3C7', 'R2C8'),
  new Arrow('R4C6', 'R4C7', 'R5C7'),

  // The outlined R6C6,R6C7,R7C7,R7C8 cage is labelled 30.
  new Cage(30, 'R6C6', 'R6C7', 'R7C7', 'R7C8'),

  // The cells are the blue stroke in drawing order; RegionSumLine splits revisits.
  new RegionSumLine(
    'R9C3', 'R8C4', 'R7C4', 'R6C4', 'R7C3', 'R8C2', 'R7C2', 'R6C2', 'R5C2'),
];
