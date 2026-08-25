// Title: XV-Sudoku, Knapp Daneben
// Author: Bernhard Seckinger
// Video: https://www.youtube.com/watch?v=Al5WNBGGYug
// Source: https://app.crackingthecryptic.com/webapp/L8jmdmmJP8

// Normal sudoku rules apply. A drawn V between two cells means their digits
// sum to 5; a drawn X means they sum to 10; no drawn mark between two cells
// means neither sum is allowed. "Knapp daneben" ("just missed it") makes
// every drawn V/X hint wrong: the true relation at a marked edge is not the
// one shown. Unmarked edges carry no hint to begin with, so they are not
// twisted and keep the plain "neither 5 nor 10" rule stated above.
//
// The 101 edges below carry no drawn mark, so digits there must not sum to
// 5 or 10. That is the only rule this script encodes -- see the omitted
// marked-edge rule below and the result's omitted_rules/notes.

// Drawn hint-mark edges, transcribed from the source's 43 overlay positions
// (all identical white-on-white "W" text boxes -- position only, no V/X
// letter is recoverable, so it is unknown which are V and which are X).
// Used only to exclude these edges from the no-sign-edge rule below: since
// "knapp daneben" makes a marked edge's true relation "not the one shown",
// and the shown one is unknown, the only sound assertion per marked edge is
// Or(not-V, not-X), a tautology (a sum cannot equal both 5 and 10 at once).
// No constraint is added for these 43 edges.
const drawnMarkedEdges = [
  ['R1C1', 'R1C2'], ['R1C2', 'R1C3'], ['R1C1', 'R2C1'], ['R2C2', 'R3C2'],
  ['R2C2', 'R2C3'], ['R3C2', 'R3C3'], ['R3C3', 'R4C3'], ['R2C4', 'R2C5'],
  ['R2C4', 'R3C4'], ['R3C4', 'R3C5'], ['R3C5', 'R4C5'], ['R1C5', 'R1C6'],
  ['R1C6', 'R1C7'], ['R2C6', 'R2C7'], ['R2C7', 'R3C7'], ['R3C6', 'R3C7'],
  ['R1C9', 'R2C9'], ['R2C9', 'R3C9'], ['R3C8', 'R3C9'], ['R5C8', 'R6C8'],
  ['R4C3', 'R4C4'], ['R4C1', 'R5C1'], ['R4C4', 'R5C4'], ['R4C5', 'R5C5'],
  ['R5C2', 'R5C3'], ['R5C5', 'R5C6'], ['R5C4', 'R6C4'], ['R6C4', 'R7C4'],
  ['R6C5', 'R7C5'], ['R6C4', 'R6C5'], ['R6C6', 'R6C7'], ['R6C1', 'R7C1'],
  ['R8C1', 'R9C1'], ['R7C2', 'R7C3'], ['R7C3', 'R8C3'], ['R9C2', 'R9C3'],
  ['R7C4', 'R7C5'], ['R7C5', 'R7C6'], ['R7C6', 'R7C7'], ['R8C6', 'R9C6'],
  ['R9C7', 'R9C8'], ['R8C8', 'R8C9'], ['R8C9', 'R9C9'],
];
const markedKey = (a, b) => [a, b].sort().join('-');
const markedSet = new Set(drawnMarkedEdges.map(([a, b]) => markedKey(a, b)));

// Every orthogonally-adjacent cell pair in the grid, minus the 43 marked
// edges above, is a "no sign" edge: sum(digits) !== 5 and !== 10. Split by
// direction (same row vs same column) so each direction can be applied as one
// Replicate template instead of one Pair per edge.
const graph = cellGraph('9x9');
const seen = new Set();
const horizontalOrigins = []; // left cell of each same-row no-sign edge
const verticalOrigins = [];   // top cell of each same-column no-sign edge
for (const cell of graph.cells()) {
  for (const neighbour of graph.neighbours(cell)) {
    const key = markedKey(cell, neighbour);
    if (seen.has(key) || markedSet.has(key)) continue;
    seen.add(key);
    const { row: r1, col: c1 } = parseCellId(cell);
    const { row: r2, col: c2 } = parseCellId(neighbour);
    // Store with the top/left cell first so the two direction groups each
    // share one fixed relative offset (+1 column, or +1 row).
    if (r1 === r2) {
      horizontalOrigins.push(c1 < c2 ? cell : neighbour);
    } else {
      verticalOrigins.push(r1 < r2 ? cell : neighbour);
    }
  }
}

const notFiveOrTenKey = Pair.fnToKey((a, b) => a + b !== 5 && a + b !== 10, 9);
const horizontalTemplate =
  new Pair(notFiveOrTenKey, 'no-sign edge: not 5, not 10', 'R1C1', 'R1C2');
const verticalTemplate =
  new Pair(notFiveOrTenKey, 'no-sign edge: not 5, not 10', 'R1C1', 'R2C1');

return [
  new Shape('9x9'),

  graph.makeReplicate(horizontalTemplate, horizontalOrigins),
  graph.makeReplicate(verticalTemplate, verticalOrigins),
];
