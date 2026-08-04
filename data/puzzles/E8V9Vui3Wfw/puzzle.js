// Title: Strawberry Fields
// Author: Cris Moore
// Video: https://www.youtube.com/watch?v=E8V9Vui3Wfw
// Source: https://app.crackingthecryptic.com/sudoku/LLM2t7G4NG

// Normal sudoku rules apply (default rows/columns/3x3 boxes).
// Red cells (18 shaded cells) each index the 5 in their own row or column: a
// red cell's own value v means either the cell at (row v, its column) is 5,
// or the cell at (its row, column v) is 5 -- this is exactly the rules
// text's worked example ("if r3c6 is a 7, then either r7c6 or r3c7 is a 5").
// Fives are antiknights, scoped to digit 5 only (not the standard,
// all-digit AntiKnight class): no two 5s may be a knight's move apart.
// Gray circles (7 shaded cells) must hold odd digits.
// A white dot (1, at the R5C5/R5C6 edge) joins a consecutive pair of digits.

const graph = cellGraph('9x9');

// Red (shaded) cells, drawn as coloured background squares.
const redCellCoords = [
  [1, 4], [1, 5], [1, 6],
  [2, 5], [2, 6],
  [3, 6],
  [4, 3],
  [5, 2], [5, 3],
  [6, 1], [6, 2], [6, 3],
  [7, 9],
  [8, 7], [8, 9],
  [9, 7], [9, 8], [9, 9],
];

// Gray circles, drawn as filled grey dots.
const grayCircles = [
  [2, 2], [5, 5], [2, 8], [5, 8], [8, 2], [8, 5], [8, 8],
].map(([r, c]) => makeCellId(r, c));

// Each red cell's value v selects exactly one of its own 9 possible values;
// only that branch needs the indexing OR to hold, so the rule becomes one
// Or of nine (Given(v) And Or(the two target cells==5)) branches per cell.
const indexingConstraints = redCellCoords.map(([r, c]) => {
  const redCell = makeCellId(r, c);
  const branches = [];
  for (let v = 1; v <= 9; v++) {
    branches.push(new And([
      new Given(redCell, v),
      new Or([
        new Given(makeCellId(v, c), 5),
        new Given(makeCellId(r, v), 5),
      ]),
    ]));
  }
  return new Or(branches);
});

// No two 5s a knight's move apart. Scoped to digit 5, so built from a
// negated-pair relation over knight-move edges rather than the (all-digit)
// AntiKnight class. Only the two "downward" knight offsets are walked so
// each unordered knight-move pair of cells is visited once; one Replicate
// per offset shifts a single template Pair onto every valid origin cell for
// that offset.
const KNIGHT_OFFSETS = [[1, -2], [1, 2], [2, -1], [2, 1]];
const notBothFive = Pair.fnToKey((a, b) => !(a === 5 && b === 5), 9);
// graph.makeReplicate() always anchors its template at R1C1, which puts the
// knight-offset partner off-grid for half the offsets; anchor each template
// at its own (on-grid) first target cell instead.
const antiKnightFives = KNIGHT_OFFSETS.map(([dr, dc]) => {
  const targets = graph.cells().filter(cell => graph.step(cell, dr, dc) != null);
  const origin = targets[0];
  return new Replicate( // lint-ok: bare-replicate-constructor
    [new Pair(notBothFive, 'not both 5 (knight)', origin, graph.step(origin, dr, dc))],
    Replicate.encodeTargetCells(targets, origin, graph),
    origin,
  );
});

const grayCircleOdds = grayCircles.map(cell => new Given(cell, 1, 3, 5, 7, 9));

const whiteDot = new WhiteDot('R5C5', 'R5C6');

return [
  new Shape('9x9'),
  ...indexingConstraints,
  ...antiKnightFives,
  ...grayCircleOdds,
  whiteDot,
];
