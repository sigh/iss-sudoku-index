// Title: Jun 22, 2022: Consec Pairs
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=idOQ2SbahmQ
// Source: https://tinyurl.com/yc3fb36b

// Normal sudoku rules apply (standard rows/columns/3x3 boxes, default).
// "If two cells are separated by a white dot then they must contain
// consecutive numbers. Cells without a dot may or may not contain
// consecutive numbers." -- WhiteDot per drawn dot; no negative constraint
// on undotted pairs, matching the rules' explicit "may or may not".

const givens = [
  ['R1C6', 4], ['R2C3', 7], ['R2C7', 2], ['R3C2', 8], ['R3C8', 5],
  ['R4C1', 6], ['R5C5', 1], ['R6C9', 3], ['R7C2', 4], ['R7C8', 6],
  ['R8C3', 6], ['R8C7', 7], ['R9C4', 7],
].map(([cell, value]) => new Given(cell, value));

// White dots (consecutive digits). One entry per `difference` array item in
// the payload; no item carries a `value`, i.e. the f-puzzles default of 1.
const whiteDotEdges = [
  ['R2C4', 'R3C4'], ['R3C5', 'R3C4'], ['R3C5', 'R2C5'],
  ['R7C5', 'R8C5'], ['R7C5', 'R7C6'], ['R7C6', 'R8C6'],
  ['R5C3', 'R5C2'], ['R6C3', 'R5C3'], ['R6C3', 'R6C2'],
  ['R4C8', 'R4C7'], ['R4C7', 'R5C7'], ['R5C8', 'R5C7'],
  ['R1C8', 'R1C9'], ['R2C9', 'R1C9'], ['R1C1', 'R1C2'], ['R1C1', 'R2C1'],
  ['R8C1', 'R9C1'], ['R9C2', 'R9C1'], ['R9C9', 'R8C9'], ['R9C9', 'R9C8'],
];
const whiteDots = whiteDotEdges.map(([a, b]) => new WhiteDot(a, b));

return [
  new Shape('9x9'),
  ...givens,
  ...whiteDots,
];
