// Title: The Robin Hood Incident
// Author: Rob K
// Video: https://www.youtube.com/watch?v=wqA1M-fCe3s
// Source: https://app.crackingthecryptic.com/sudoku/3m7Q92r3qF

// Normal sudoku rules apply.
// Digits along an arrow add up to the number in a circle - in no case does any
// cell on an arrow share a row, column or 3x3 box with its circle. The X in
// R1C8 is a 1-cell arrow.
//
// The rules give each arrow "its circle", and the drawing has twelve arrows and
// twelve circles: the circles are blank, sit on no arrow, and no other rule
// mentions them, so the twelve arrows take the twelve circles one for one. What
// the drawing does not say is which: the circles carry no number, connector,
// numbering or colour coding tying them to an arrow, and the arrowheads point at
// no circle (the exclusion clause rules that out - a cell straight ahead of an
// arrowhead is in its row or column). The only correspondence the rules give is
// the exclusion clause, so the pairing is left to the solver: one Var per arrow
// names the circle it uses, those names are all different, and each arrow's Or
// ranges over exactly the circles the exclusion clause permits it.

// Arrow polylines as drawn, tail cell first, arrowhead on the last cell. Every
// cell counts toward the sum: these arrows have no bulb. The last entry is the
// X in R1C8, which the rules declare to be a one-cell arrow.
const arrows = [
  ['R9C8', 'R8C8', 'R7C9'],
  ['R7C8', 'R6C9'],
  ['R3C8', 'R3C9', 'R2C9'],
  ['R2C8', 'R2C7'],
  ['R4C5', 'R3C6', 'R2C6'],
  ['R2C2', 'R2C3'],
  ['R3C1', 'R2C1'],
  ['R3C3', 'R3C2'],
  ['R5C3', 'R4C4'],
  ['R7C5', 'R6C6'],
  ['R9C2', 'R8C2', 'R8C1'],
  ['R1C8'],
];

// The twelve blank circle overlays, in reading order.
const circles = [
  'R1C1', 'R1C4', 'R1C5', 'R1C6',
  'R2C4', 'R3C7',
  'R6C1', 'R6C4', 'R6C8',
  'R9C1', 'R9C4', 'R9C9',
];

// "share a row, column or 3x3 box", as a predicate on two cell ids.
const shares = (a, b) => {
  const p = parseCellId(a);
  const q = parseCellId(b);
  const boxRow = c => (c.row - 1) / 3 | 0;
  const boxCol = c => (c.col - 1) / 3 | 0;
  return p.row === q.row
    || p.col === q.col
    || (boxRow(p) === boxRow(q) && boxCol(p) === boxCol(q));
};

const graph = cellGraph('9x9');

// One cell per arrow, holding the 1-based index of the circle that arrow uses.
// The alphabet is widened to 12 so the index fits; the playable grid cells are
// put back to 1-9 below.
const choice = new Var('A', 'ArrowCircle', arrows.length);

return [
  new Shape('9x9', circles.length),
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  choice,
  // Twelve arrows, twelve circles, one each: no two arrows name the same circle.
  new AllDifferent(...choice.cells()),
  // Arrow(circle, ...arrowCells): the circle's digit equals the sum of the rest.
  ...arrows.map((cells, i) => new Or(
    circles
      .map((circle, j) => ({ circle, index: j + 1 }))
      .filter(({ circle }) => cells.every(cell => !shares(cell, circle)))
      .map(({ circle, index }) => new And([
        new Arrow(circle, ...cells),
        new Given(choice.cell(i + 1), index),
      ])))),
];
