// Title: Giraffe Hunt 2
// Author: bellal
// Video: https://www.youtube.com/watch?v=NPRnv3gDmCE
// Source: https://sudokupad.app/9yho58uz5e

// Standard 9x9 sudoku (default row/column/box all-different).
// Anti-giraffe: a cell and any other cell (1,4) rows/columns apart cannot
// share a digit -- built below as one AllDifferent per (dRow, dCol) delta,
// replicated over every grid position where the shifted cell stays on board.
// Black dots hold digits in a 1:2 ratio (BlackDot); white dots hold
// consecutive digits (WhiteDot). The thermometer increases from its bulb
// (Thermo, bulb cell first). The black cage's digits are distinct and sum to
// 12 (Cage). The two blue cages hold the same pair of digits (SameValues).

const graph = cellGraph('9x9');

// Anti-giraffe. Only the four deltas with dRow > 0 are used: the mirror
// deltas (dRow < 0) would just regenerate the same unordered pairs from the
// other endpoint. Uses a bare Replicate (not graph.makeReplicate(), which
// always anchors at R1C1) because R1C1 plus a negative-column delta falls off
// the grid; instead the origin is the lowest-index cell whose shifted partner
// is still on the grid, which is also the first of its own target list.
const antiGiraffeDeltas = [[1, 4], [1, -4], [4, 1], [4, -1]];
const antiGiraffe = antiGiraffeDeltas.map(([dRow, dCol]) => {
  const targets = graph.cells().filter(
    cell => graph.step(cell, dRow, dCol) !== null);
  const anchor = targets[0];
  const shiftedAnchor = graph.step(anchor, dRow, dCol);
  return new Replicate(
    [new AllDifferent(anchor, shiftedAnchor)],
    Replicate.encodeTargetCells(targets, anchor, graph),
    anchor,
  );
});

// Black dots, transcribed one edge per drawn marker.
const blackDots = [
  ['R2C2', 'R2C3'], ['R2C2', 'R3C2'], ['R3C2', 'R3C3'], ['R3C6', 'R4C6'],
  ['R5C3', 'R5C4'], ['R7C7', 'R7C8'], ['R7C7', 'R8C7'], ['R8C7', 'R8C8'],
].map(([a, b]) => new BlackDot(a, b));

// White dots, transcribed one edge per drawn marker.
const whiteDots = [
  ['R5C6', 'R5C7'], ['R3C7', 'R3C8'], ['R2C7', 'R3C7'], ['R2C7', 'R2C8'],
].map(([a, b]) => new WhiteDot(a, b));

return [
  new Shape('9x9'),
  ...antiGiraffe,
  ...blackDots,
  ...whiteDots,
  new Thermo('R7C3', 'R7C2', 'R8C2', 'R8C3', 'R9C2'),
  new Cage(12, 'R4C5', 'R4C6', 'R5C5'),
  new SameValues(2, 'R1C1', 'R1C2', 'R8C9', 'R9C9'),
];
