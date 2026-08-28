// Title: The Dutch Master Again
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=knV3Q3WqUpM
// Source: https://cracking-the-cryptic.web.app/sudoku/ftHB9mP9PP

// Normal sudoku rules apply on the 9x9 board (rows, columns and the 9
// standard 3x3 boxes, all-different).
//
// "Each 3x3 box uses a different number (1-9); dots show ALL the
// differences of that number in the box." Read as an exhaustive marking:
// each box is associated with one number N in 1-9, all nine boxes' numbers
// form a bijection onto 1-9, and for every orthogonally-adjacent cell pair
// *within* that box a dot is present iff the pair's digits differ by
// exactly N (so it is absent iff they do not -- "shows ALL the
// differences" commits to the negative half too, not only "a dot implies
// difference N"). Box 6 (rows 4-6, cols 7-9) carries no dot at all,
// consistent with N=9 there: no two digits from 1-9 can differ by 9 except
// 1 and 9 themselves, and that pairing never recurs twice in one 3x3 box,
// so a dot-free box is a live outcome, not missed geometry.
//
// A decorative two-column legend outside the 9x9 board (a plain 1..9
// sequence, disconnected from the board) carries no rules-text meaning and
// is not modelled here.

const graph = cellGraph('9x9');

// A box's 12 internal orthogonally-adjacent cell pairs: every neighbour
// relation among the box's own 9 cells, each pair counted once.
function boxEdges(boxCells) {
  const inBox = new Set(boxCells);
  const pairs = [];
  boxCells.forEach((cell, i) => {
    for (const neighbour of graph.neighbours(cell)) {
      if (inBox.has(neighbour) && boxCells.indexOf(neighbour) > i) {
        pairs.push([cell, neighbour]);
      }
    }
  });
  return pairs;
}

// Dot edges, transcribed from the puzzle's rounded edge-sized overlay
// marks (white fill, black border, empty text -- position on the edge is
// the only signal they carry). Every other internal box edge is dot-less
// by omission, derived below as the complement of this list against each
// box's own edges.
const dotEdges = [
  ['R1C2', 'R1C3'], ['R1C1', 'R1C2'], ['R1C1', 'R2C1'], ['R2C1', 'R3C1'], // box 1
  ['R2C4', 'R2C5'], ['R2C5', 'R2C6'], ['R3C5', 'R3C6'],                   // box 2
  ['R2C7', 'R2C8'], ['R3C8', 'R3C9'],                                     // box 3
  ['R4C2', 'R5C2'], ['R5C2', 'R6C2'],                                     // box 4
  ['R4C6', 'R5C6'], ['R6C4', 'R6C5'],                                     // box 5
  // box 6: none drawn
  ['R7C1', 'R7C2'], ['R8C1', 'R8C2'], ['R8C3', 'R9C3'],                   // box 7
  ['R8C6', 'R9C6'], ['R9C4', 'R9C5'],                                     // box 8
  ['R7C8', 'R8C8'],                                                       // box 9
];
const dotKey = ([a, b]) => [a, b].sort().join('-');
const dotSet = new Set(dotEdges.map(dotKey));

// One aux Var per box holds that box's number (1-9); AllDifferent over 9
// vars on a 9-value domain forces the bijection the rule states.
const boxNumberVar = new Var('BN', 'box difference number', 9);

// Each box's number is an existential match against a small fixed
// candidate set (1-9) whose test (every edge's dot/no-dot condition) needs
// the candidate fixed before it can be checked, so this is one Or of And
// of Pair per box over the 9 candidates, rather than a state machine
// carrying the candidate as extra state through every edge read.
const boxConstraints = graph.boxes().map((boxCells, i) => {
  const edges = boxEdges(boxCells);
  const varCell = boxNumberVar.cell(i + 1);
  const branches = [];
  for (let n = 1; n <= 9; n++) {
    const pairs = edges.map(([a, b]) => {
      const isDot = dotSet.has(dotKey([a, b]));
      const fn = isDot
        ? (x, y) => Math.abs(x - y) === n
        : (x, y) => Math.abs(x - y) !== n;
      return new Pair(Pair.fnToKey(fn, 9), '', a, b);
    });
    branches.push(new And([new Given(varCell, n), ...pairs]));
  }
  return new Or(branches);
});

return [
  new Shape('9x9'),
  new Given('R4C1', 8),
  new Given('R4C4', 2),
  new Given('R5C5', 3),
  new Given('R6C6', 4),
  new Given('R6C9', 5),
  boxNumberVar,
  new AllDifferent(...boxNumberVar.cells()),
  ...boxConstraints,
];
