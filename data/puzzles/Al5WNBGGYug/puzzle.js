// Title: XV-Sudoku, Knapp Daneben
// Author: Bernhard Seckinger
// Video: https://www.youtube.com/watch?v=Al5WNBGGYug
// Source: https://app.crackingthecryptic.com/webapp/L8jmdmmJP8

// Normal sudoku rules apply. A V between two cells means the two digits sum to
// 5; an X means they sum to 10; between two cells with no sign, neither holds.
// All hints are "knapp daneben": each drawn hint is one before or one after the
// symbol that should be there.
//
// Nothing drawn on this board is a V, an X, or a legal digit. Every edge mark is
// the letter W, and the two cell marks are a 0 and a 9. Reading each hint one
// step off in its own sequence:
//   - W sits between V and X in the alphabet, so a marked edge carries a V or an
//     X and the mark does not say which: that pair sums to 5 or to 10.
//   - the cell marked 0 is one step from -1 or 1, and only 1 is a digit.
//   - the cell marked 9 is one step from 8 or 10, and only 8 is a digit.
// An edge with no mark carries no sign, so the negative rule applies there.

// The 43 drawn edge marks, transcribed from the board's edge overlays (all 43
// are the same white "W" mark; only their positions differ).
const markedEdges = [
  ['R1C1', 'R1C2'], ['R1C1', 'R2C1'], ['R1C2', 'R1C3'], ['R1C5', 'R1C6'],
  ['R1C6', 'R1C7'], ['R1C9', 'R2C9'], ['R2C2', 'R2C3'], ['R2C2', 'R3C2'],
  ['R2C4', 'R2C5'], ['R2C4', 'R3C4'], ['R2C6', 'R2C7'], ['R2C7', 'R3C7'],
  ['R2C9', 'R3C9'], ['R3C2', 'R3C3'], ['R3C3', 'R4C3'], ['R3C4', 'R3C5'],
  ['R3C5', 'R4C5'], ['R3C6', 'R3C7'], ['R3C8', 'R3C9'], ['R4C1', 'R5C1'],
  ['R4C3', 'R4C4'], ['R4C4', 'R5C4'], ['R4C5', 'R5C5'], ['R5C2', 'R5C3'],
  ['R5C4', 'R6C4'], ['R5C5', 'R5C6'], ['R5C8', 'R6C8'], ['R6C1', 'R7C1'],
  ['R6C4', 'R6C5'], ['R6C4', 'R7C4'], ['R6C5', 'R7C5'], ['R6C6', 'R6C7'],
  ['R7C2', 'R7C3'], ['R7C3', 'R8C3'], ['R7C4', 'R7C5'], ['R7C5', 'R7C6'],
  ['R7C6', 'R7C7'], ['R8C1', 'R9C1'], ['R8C6', 'R9C6'], ['R8C8', 'R8C9'],
  ['R8C9', 'R9C9'], ['R9C2', 'R9C3'], ['R9C7', 'R9C8'],
];

// Every orthogonally adjacent pair of the 9x9 grid.
function allAdjacentPairs() {
  const pairs = [];
  for (let r = 1; r <= 9; r++) {
    for (let c = 1; c <= 9; c++) {
      if (c < 9) pairs.push([makeCellId(r, c), makeCellId(r, c + 1)]);
      if (r < 9) pairs.push([makeCellId(r, c), makeCellId(r + 1, c)]);
    }
  }
  return pairs;
}

const edgeKey = pair => [...pair].sort().join('-');
const marked = new Set(markedEdges.map(edgeKey));
const unmarkedEdges = allAdjacentPairs().filter(p => !marked.has(edgeKey(p)));

// No sign on this edge: neither the V relation nor the X relation holds.
const noSignKey = Pair.fnToKey((a, b) => a + b !== 5 && a + b !== 10, 9);

const graph = cellGraph('9x9');

return [
  new Shape('9x9'),

  // The two "knapp daneben" digit hints, resolved above.
  new Given('R6C8', 1),
  new Given('R9C4', 8),

  ...markedEdges.map(([a, b]) => new Or([new V(a, b), new X(a, b)])),

  // Each unmarked edge is a shifted copy of one template pair: one template for
  // the horizontal offset, one for the vertical. (StrictXV cannot serve here --
  // it rejects V/X constraints that sit inside an Or.)
  graph.makeReplicate(
    new Pair(noSignKey, 'no sign', 'R1C1', 'R1C2'),
    unmarkedEdges.filter(([a, b]) => parseCellId(a).row === parseCellId(b).row)
      .map(([a]) => a)),
  graph.makeReplicate(
    new Pair(noSignKey, 'no sign', 'R1C1', 'R2C1'),
    unmarkedEdges.filter(([a, b]) => parseCellId(a).col === parseCellId(b).col)
      .map(([a]) => a)),
];
