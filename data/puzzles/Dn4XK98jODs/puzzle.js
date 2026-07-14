// Title: Heavy
// Author: tallcat and zetamath
// Video: https://www.youtube.com/watch?v=Dn4XK98jODs
// Source: https://sudokupad.app/svjdl9l4ck

// Each purple line's cell path, in drawn order (first/last = the line's two
// ends).
const purpleLines = [
  ['R2C1', 'R1C1', 'R1C2', 'R2C2'],
  ['R2C3', 'R1C3', 'R1C4', 'R2C4'],
  ['R2C6', 'R1C6', 'R1C5', 'R2C5'],
  ['R2C7', 'R1C7', 'R1C8', 'R2C8'],
  ['R3C8', 'R4C8', 'R5C8', 'R4C9', 'R3C9'],
  ['R3C2', 'R4C2', 'R5C2', 'R4C1', 'R3C1'],
  ['R3C4', 'R3C5', 'R4C4', 'R4C5'],
  ['R6C3', 'R6C2', 'R7C2', 'R8C2'],
  ['R6C7', 'R6C8', 'R7C8', 'R8C8'],
  ['R5C5', 'R6C5', 'R7C5'],
  ['R9C4', 'R8C5', 'R9C6', 'R9C7'],
];

// Renban gives each line a non-repeating set of consecutive digits.
//
// "The largest digit is at one of the ends" is equivalent to "every interior
// cell is smaller than at least one end" (if some interior cell beat both
// ends, it would be the line's largest digit, which is disallowed): for each
// interior cell, an Or of two greater-than Pairs against the two end cells.
// Renban's built-in all-different already rules out an interior digit tying
// an end, so strict '>' is enough.
const gt = Pair.fnToKey((a, b) => a > b, 9);

const maxAtEnds = cells => {
  const first = cells[0];
  const last = cells[cells.length - 1];
  return cells.slice(1, -1).map(interior => new Or([
    new Pair(gt, '', first, interior),
    new Pair(gt, '', last, interior),
  ]));
};

return [
  new Shape('9x9'),
  ...purpleLines.map(cells => new Renban(...cells)),
  ...purpleLines.flatMap(maxAtEnds),
];
