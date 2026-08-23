// Title: Wheel Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=_YomjQ0aIbg
// Source: https://app.crackingthecryptic.com/sudoku/4r2BpLTLNG
//
// Normal sudoku rules apply (default row/column/box all-different, no givens).
// Nine "wheels" are drawn as circles; each wheel's hub cell carries no value
// itself and is not part of the wheel. Each wheel has four labelled cells --
// the ones directly North, East, South and West of its hub -- with a printed
// digit apiece. Reading clockwise (N -> E -> S -> W -> N), the four printed
// digits must appear in the four physical cells in that same cyclic order,
// but which physical cell the sequence starts on ("the wheel rotated into the
// correct position") is unknown: any of the 4 cyclic rotations is allowed.
// This is encoded as an Or of the 4 rotations, each an And of 4 Givens pinning
// the rotated value onto each N/E/S/W cell.

// Table transcribed from the drawn wheel graphics: each wheel's hub (circle)
// cell and its four clockwise (N,E,S,W) printed values.
const WHEELS = [
  { hub: 'R3C4', cells: ['R2C4', 'R3C5', 'R4C4', 'R3C3'], values: [2, 2, 4, 4] },
  { hub: 'R6C3', cells: ['R5C3', 'R6C4', 'R7C3', 'R6C2'], values: [4, 4, 6, 6] },
  { hub: 'R7C6', cells: ['R6C6', 'R7C7', 'R8C6', 'R7C5'], values: [6, 6, 8, 8] },
  { hub: 'R4C7', cells: ['R3C7', 'R4C8', 'R5C7', 'R4C6'], values: [8, 8, 2, 2] },
  { hub: 'R2C6', cells: ['R1C6', 'R2C7', 'R3C6', 'R2C5'], values: [1, 1, 3, 5] },
  { hub: 'R4C2', cells: ['R3C2', 'R4C3', 'R5C2', 'R4C1'], values: [3, 3, 7, 5] },
  { hub: 'R8C4', cells: ['R7C4', 'R8C5', 'R9C4', 'R8C3'], values: [5, 5, 7, 1] },
  { hub: 'R6C8', cells: ['R5C8', 'R6C9', 'R7C8', 'R6C7'], values: [7, 7, 3, 9] },
  { hub: 'R5C5', cells: ['R4C5', 'R5C6', 'R6C5', 'R5C4'], values: [3, 5, 7, 9] },
];

// Build the rotation-disjunction for one wheel: for each of the 4 possible
// starting offsets, pin cells[i] to values[(i + offset) % 4] for all i.
const wheelConstraint = ({ cells, values }) => {
  const rotations = [];
  for (let offset = 0; offset < 4; offset++) {
    const givens = cells.map(
      (cell, i) => new Given(cell, values[(i + offset) % 4]));
    rotations.push(new And(givens));
  }
  return new Or(rotations);
};

return [
  new Shape('9x9'),
  ...WHEELS.map(wheelConstraint),
];
