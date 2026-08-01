// Title: Cobra's Curse
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=Jv_jTv8V2Zc
// Source: https://sudokupad.app/748nmm3bpM

// Normal 9x9 Sudoku. Blue lines are region sum lines. Brown product sum lines
// have endpoint product equal to the sum of all digits on the line. The
// solver-discovered snake and every rule referring to it are omitted.

// Enumerate endpoint digits: each branch fixes them and makes the entire line
// sum their product, directly expressing the brown-line rule.
const productSumLine = cells => new Or(
  Array.from({ length: 9 }, (_, a) => a + 1).flatMap(a =>
    Array.from({ length: 9 }, (_, b) => b + 1).map(b => new And([
      new Given(cells[0], a),
      new Given(cells.at(-1), b),
      new Sum(a * b, ...cells),
    ]))
  )
);

return [
  new Shape('9x9'),
  // Blue line paths transcribed from the blue strokes.
  new RegionSumLine('R1C7', 'R1C6', 'R1C5', 'R2C5'),
  new RegionSumLine('R2C9', 'R3C9', 'R4C9', 'R4C8'),
  // Brown line paths transcribed from the brown strokes.
  productSumLine(['R2C3', 'R3C3', 'R4C3', 'R4C4']),
  productSumLine(['R7C5', 'R7C6', 'R7C7', 'R6C7']),
  productSumLine([
    'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4',
  ]),
];
