// Title: Missing The Target
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=ax_9WOig9sc
// Source: https://app.crackingthecryptic.com/sudoku/ndM7Hr7PQm
//
// Normal sudoku, standard 3x3 boxes. Each arrow's drawn tip must be extended
// by one further cell, a king's move away, whose digit is included in the
// circle's sum along with the drawn arrow cells. Extensions cannot land on
// any given circle or any cell already part of any arrow, and no two arrows
// may extend to the same cell.
//
// Each arrow below is [bulb cell (circled), ...plain path cells, drawn tip]
// (bulb first, tip last), transcribed from the drawn arrow waypoints.
const ARROWS = [
  ['R1C1', 'R1C2'],
  ['R1C5', 'R1C4', 'R2C4'],
  ['R1C9', 'R1C8', 'R1C7', 'R1C6'],
  ['R7C1', 'R6C1', 'R6C2'],
  ['R9C1', 'R8C1', 'R8C2', 'R8C3'],
  ['R6C6', 'R6C7', 'R7C8'],
  ['R6C5', 'R5C4', 'R4C4'],
  ['R6C4', 'R7C5', 'R7C6'],
  ['R2C2', 'R3C1'],
  ['R5C9', 'R4C9'],
  ['R9C8', 'R8C9', 'R8C8'],
];

const graph = cellGraph('9x9');

// Every cell that is part of any arrow's drawn path (bulb or plain cell).
// The 11 given circles all sit exactly on the bulb cells, so this set alone
// covers "cannot be on a given circle or a given arrow cell".
const drawnArrowCells = new Set(ARROWS.flat());

// Candidate extension cells per arrow: king's-move neighbours of the drawn
// tip, excluding any cell already used by any arrow.
const candidatesByArrow = ARROWS.map(
  path => graph.kingNeighbours(path[path.length - 1])
    .filter(cell => !drawnArrowCells.has(cell)));

// Union of all candidate cells, used as a small auxiliary overlay: `claim`
// holds 0 if unclaimed, or the 1-based arrow index that has extended to it.
// Two arrows can never claim the same cell because each union cell has a
// single claim value -- this is exactly "arrows cannot share their last
// missing cell".
const unionCells = [...new Set(candidatesByArrow.flat())];
const claim = graph.makeOverlay('VC', unionCells);

// For each union cell, the arrow indices (1-based) that could claim it.
const claimantsOf = new Map(unionCells.map(cell => [cell, []]));
candidatesByArrow.forEach((cands, i) => {
  for (const cell of cands) claimantsOf.get(cell).push(i + 1);
});

return [
  // Widen the alphabet to fit the claim overlay's 0 (unclaimed) plus the
  // 11 arrow indices; grid cells are restricted back to 1-9 below. Boxes
  // still tile 3x3 (size comes from the 9x9 dimensions, not the alphabet).
  new Shape('9x9', '0-11'),
  graph.makeReplicate(new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),

  claim.toVar('claim: which arrow (if any) has extended to this cell'),
  // Restrict each union cell to 0 or one of the arrow indices it could
  // actually be claimed by.
  ...unionCells.map(cell => new Given(claim.at(cell), 0, ...claimantsOf.get(cell))),

  // For each arrow: exactly one of its candidate cells is claimed by it
  // (ContainExact on just that arrow's candidate cells), and for whichever
  // cell that is, the circle equals the sum of the drawn arrow cells (minus
  // the bulb) plus that cell's digit.
  ...ARROWS.flatMap((path, i) => {
    const arrowIndex = i + 1;
    const [bulb, ...rest] = path;
    const cands = candidatesByArrow[i];
    return [
      new ContainExact(`${arrowIndex}`, ...claim.at(cands)),
      new Or(cands.map(cell => new And([
        new Given(claim.at(cell), arrowIndex),
        new Arrow(bulb, ...rest, cell),
      ]))),
    ];
  }),
];
