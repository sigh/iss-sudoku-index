// Title: Reflection & Rotation
// Author: Ore
// Video: https://www.youtube.com/watch?v=jlaarKBCH18
// Source: https://app.crackingthecryptic.com/sudoku/BmpqMLt84f

// Rules encoded:
// - Normal sudoku rules apply (Shape gives the default row/column/box
//   all-different constraints).
// - Givens: R1C8=1, R5C6=6, R8C2=2.
// - "One row or one column is occupied by an invisible 9-cell long
//   thermometer, along which digits increase." A 9-cell strictly-increasing
//   thermometer spanning a whole row/column, combined with sudoku's rule
//   that a line already holds each of 1-9 once, forces that line to read
//   1,2,...,9 in the thermometer's bulb-to-tip direction. Which line, and
//   which of its two directions, is undetermined by the rules text, so this
//   is encoded as a disjunction over every row and column in both
//   directions (36 branches), each branch pinning that whole line with
//   Givens.
// - "Box 2 and Box 6 have mirror symmetry about the yellow axis." The
//   yellow underlay covers exactly Box 2 (R1-3,C4-6) and Box 6 (R4-6,C7-9),
//   and the drawn gold line runs R3C7-R4C6, both endpoints on the diagonal
//   r+c=10 -- the corner shared by the two boxes. So the axis is r+c=10;
//   reflecting a cell (r,c) across it gives (10-c,10-r). Encoded as one
//   SameValues(2, cell, reflectedCell) per reflected pair (9 pairs).
// - "Box 4 and Box 8 have rotational symmetry around the blue dot." The
//   blue underlay covers exactly Box 4 (R4-6,C1-3) and Box 8 (R7-9,C4-6);
//   the small corner-marker overlay sits at the corner shared by
//   R6C3/R6C4/R7C3/R7C4, i.e. point (6.5,3.5) -- also the midpoint of the
//   two boxes' centres (5,2) and (8,5), confirming a 180-degree rotation
//   about that point: (r,c) -> (13-r,7-c). Encoded as one
//   SameValues(2, cell, rotatedCell) per rotated pair (9 pairs).
// - "A clue outside the grid shows the sum of the indicated diagonal, which
//   may include repeat digits." Four Little Killer diagonal-sum clues;
//   "may include repeat digits" is exactly LittleKiller's own semantics and
//   needs no extra encoding. Each diagonal's cells are derived from the
//   drawn arrow's on-grid start cell and direction via cellGraph().ray(...),
//   rather than hand-enumerated.

const shape = new Shape('9x9');
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const givens = [
  new Given('R1C8', 1),
  new Given('R5C6', 6),
  new Given('R8C2', 2),
];

// Invisible increasing thermometer: exactly one full row or column, read in
// one of its two directions, equals 1,2,...,9 in order.
const thermoBranches = [];
for (const line of [...graph.rows(), ...graph.columns()]) {
  for (const ascending of [true, false]) {
    const lineGivens = line.map(
      (cell, i) => new Given(cell, ascending ? i + 1 : 9 - i));
    thermoBranches.push(new And(lineGivens));
  }
}
const thermoConstraint = new Or(thermoBranches);

// Mirror symmetry: Box 2 <-> Box 6 about axis r+c=10. Each reflected pair is
// two size-1 "sets" that SameValues forces to hold the same value.
const mirrorPairs = graph.box(2).map(cell => {
  const { row, col } = parseCellId(cell);
  return new SameValues(2, cell, makeCellId(10 - col, 10 - row));
});

// Rotational symmetry: Box 4 <-> Box 8, 180 degrees about (6.5,3.5).
const rotationPairs = graph.box(4).map(cell => {
  const { row, col } = parseCellId(cell);
  return new SameValues(2, cell, makeCellId(13 - row, 7 - col));
});

// Outside diagonal-sum (Little Killer) clues.
const littleKillers = [
  LittleKiller.fromCells(32, graph.ray('R6C9', 1, -1), geometry),
  LittleKiller.fromCells(29, graph.ray('R1C4', 1, -1), geometry),
  LittleKiller.fromCells(63, graph.ray('R1C2', 1, 1), geometry),
  LittleKiller.fromCells(33, graph.ray('R3C1', 1, 1), geometry),
];

return [
  shape,
  ...givens,
  thermoConstraint,
  ...mirrorPairs,
  ...rotationPairs,
  ...littleKillers,
];
