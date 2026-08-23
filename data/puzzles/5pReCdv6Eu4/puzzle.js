// Title: Faceless Apparition
// Author: Barrels
// Video: https://www.youtube.com/watch?v=5pReCdv6Eu4
// Source: https://app.crackingthecryptic.com/sudoku/BdG6DPp6pL
//
// Normal sudoku rules apply. For any digit x that sits in a circled cell,
// both x-1 and x+1 (1 and 9 count as consecutive, so 1's predecessor is 9
// and 9's successor is 1) must appear somewhere exactly x cells away from
// that circle, straight along its row or its column (never diagonally).
// Circle positions are undecorated (no printed digit); the constrained
// digit is whichever value the solver places there.
//
// Encoding: a circle's own value is unknown, so the "x cells away" distance
// is value-dependent. For each circle cell C this is modelled as a
// disjunction over C's nine possible values v: the branch for v is
// And(Given(C, v), <v-1 found at distance v>, <v+1 found at distance v>),
// where each "<found>" clause is an Or of Given(cell, target) over every
// in-grid cell exactly v steps up/down/left/right of C. A branch whose
// distance-v cell set is empty in either direction is omitted rather than
// built as an empty Or, which correctly forbids that value at that circle
// (this is why circles can never hold 9 on a 9-wide/tall grid: no cell is
// 9 steps away from any cell).

const circles = [
  'R1C9', 'R3C9', 'R1C4', 'R3C3', 'R4C2', 'R4C7',
  'R5C5', 'R5C6', 'R5C4', 'R6C4', 'R6C5', 'R8C3', 'R9C4', 'R9C1',
]; // the 14 drawn circle overlays

function candidatesAtDistance(row, col, dist) {
  const cells = [];
  for (const [dr, dc] of [[-dist, 0], [dist, 0], [0, -dist], [0, dist]]) {
    const r = row + dr, c = col + dc;
    if (r >= 1 && r <= 9 && c >= 1 && c <= 9) {
      cells.push(makeCellId(r, c));
    }
  }
  return cells;
}

function foundAtDistance(row, col, dist, target) {
  const cells = candidatesAtDistance(row, col, dist);
  if (cells.length === 0) return null;
  return new Or(cells.map(cell => new Given(cell, target)));
}

function circleConstraint(cellId) {
  const { row, col } = parseCellId(cellId);
  const branches = [];
  for (let v = 1; v <= 9; v++) {
    const pred = v === 1 ? 9 : v - 1;
    const succ = v === 9 ? 1 : v + 1;
    const predFound = foundAtDistance(row, col, v, pred);
    const succFound = foundAtDistance(row, col, v, succ);
    if (!predFound || !succFound) continue; // no cell v away in either direction
    branches.push(new And([new Given(cellId, v), predFound, succFound]));
  }
  return new Or(branches);
}

return [
  new Shape('9x9'),
  ...circles.map(circleConstraint),
];
