// Title: Quadruple Z
// Author: Adrian Krawczyk
// Video: https://www.youtube.com/watch?v=ZkouBGoV_1E
// Source: https://app.crackingthecryptic.com/sudoku/6nRNmRN7L7

// Normal sudoku rules apply (standard 9x9, given box regions match the
// default 3x3 boxes). Digits on an arrow sum to the number in the attached
// circle. On each coloured line, the Nth digit from one end and the Nth
// digit from the other end sum to 10 -- a reflection-across-the-line rule,
// applied here as a Sum(10, ...) constraint on each such pair of cells.

// Arrows: bulb cell first, then arm cells. Cell lists are the drawn
// `arrows[].wayPoints`, snapped to nearest cell centres; two arrows
// (R5C4) share one bulb.
const arrows = [
  ['R1C7', 'R2C6', 'R2C7', 'R2C8'],
  ['R2C5', 'R1C6', 'R1C5', 'R1C4'],
  ['R6C7', 'R5C7', 'R6C8'],
  ['R9C7', 'R8C7', 'R8C8', 'R8C9'],
  ['R5C4', 'R6C4', 'R6C5'],
  ['R5C4', 'R4C4', 'R5C5', 'R5C6'],
  ['R5C3', 'R4C2', 'R5C1'],
];

// Coloured lines, one end to the other. Cell lists are the drawn
// `lines[].wayPoints`, interpolated to cell centres. Reflection pairs (the
// cell at position i from one end with the cell at position i from the
// other end) are derived below from each list, not hand-listed.
const lines = [
  ['R1C7', 'R1C8', 'R2C8', 'R3C8', 'R3C7'],
  ['R1C6', 'R1C5', 'R2C5', 'R2C6', 'R3C6', 'R3C5'],
  ['R1C1', 'R1C2', 'R1C3', 'R2C2', 'R3C1', 'R3C2', 'R3C3', 'R4C2',
   'R5C1', 'R5C2', 'R5C3', 'R6C2', 'R7C1', 'R7C2', 'R7C3', 'R8C2',
   'R9C1', 'R9C2', 'R9C3'],
  ['R9C7', 'R9C8', 'R9C9', 'R8C9'],
];

const reflectionSums = lines.flatMap(cells => {
  const pairs = [];
  for (let i = 0; i < Math.floor(cells.length / 2); i++) {
    pairs.push(new Sum(10, cells[i], cells[cells.length - 1 - i]));
  }
  if (cells.length % 2 === 1) {
    // Odd-length line: the centre cell is paired with itself, so
    // X + X = 10, i.e. twice its value is 10.
    const mid = cells[(cells.length - 1) / 2];
    pairs.push(new Sum(10, [mid, 2]));
  }
  return pairs;
});

return [
  new Shape('9x9'),

  // Givens (R6C1 and R8C1).
  new Given('R6C1', 2),
  new Given('R8C1', 8),

  ...arrows.map(cells => new Arrow(...cells)),
  ...reflectionSums,
];
