// Title: Consecutive Path Sudoku
// Author: Brandon Dong
// Video: https://www.youtube.com/watch?v=kQ7NfPaIirY
// Source: https://app.crackingthecryptic.com/webapp/pgBDpmmFFM

// Normal sudoku rules apply. For every cell holding 1, there must exist a
// path of orthogonally-adjacent cells starting there and visiting 2, then 3,
// ... up to 9, each step exactly one more than the last. The rule is only
// stated for 1s (the path start), not for every digit 1-8, so it is not
// encoded as "every v has an adjacent v+1" -- that would accept a strictly
// smaller set of grids than the rule as written and would be a tightening,
// not a faithful reading.
//
// Modeled with a boolean overlay CK (FALSE=1, TRUE=2) over every grid cell,
// asserting both directions of:
//   CK(cell) == TRUE  iff  digit(cell) == 9
//                       or some orthogonal neighbour N has
//                          digit(N) == digit(cell) + 1  and  CK(N) == TRUE.
// Both directions are needed: "CK true implies justified" alone would leave
// CK free to be TRUE or FALSE wherever no chain is actually required, and
// that free layer would inflate the reported solution count without
// changing which grids satisfy the rule. The rule itself then reduces to:
// digit(cell) == 1 implies CK(cell) == TRUE.

const FALSE = 1, TRUE = 2;

const graph = cellGraph('9x9');
const ck = graph.makeOverlay('VK');

// justified(X, Y, ckY) accepts exactly the (X, Y, ckY) triple that makes
// neighbour Y a valid successor to X along the chain: Y == X + 1 and Y's own
// CK is already TRUE.
const justified = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, x: value };
    if (state.phase === 1) return { phase: 2, x: state.x, y: value };
    return (state.y === state.x + 1 && value === TRUE) ? { phase: 3 } : undefined;
  },
  accept: (state) => state.phase === 3,
}, 9);

// notJustified is the complement of justified over the same three cells:
// it accepts every (X, Y, ckY) except the one justified accepts.
const notJustified = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, x: value };
    if (state.phase === 1) return { phase: 2, x: state.x, y: value };
    return (state.y === state.x + 1 && value === TRUE) ? undefined : { phase: 3 };
  },
  accept: (state) => state.phase === 3,
}, 9);

const givens = [
  ['R1C5', 5], ['R1C9', 8], ['R2C3', 8], ['R2C9', 6], ['R3C4', 2], ['R3C6', 8],
  ['R4C1', 8], ['R4C4', 5], ['R4C8', 9], ['R5C1', 1], ['R5C8', 8], ['R6C5', 8],
  ['R7C4', 8], ['R7C5', 7], ['R8C7', 8], ['R9C2', 8], ['R9C3', 1],
].map(([cell, v]) => new Given(cell, v));

// Restrict the whole overlay to its two real states in one shot (default
// domain is 1-9); all 81 cells share the same template.
const chainConstraints = [
  ck.makeReplicate(new Given(ck.cells()[0], FALSE, TRUE)),
];
for (const cell of graph.cells()) {
  const cellCk = ck.at(cell);
  const neighbours = graph.neighbours(cell);

  // Forward: CK(cell) implies digit==9 or some neighbour justifies it.
  chainConstraints.push(new Or([
    new Given(cellCk, FALSE),
    new Given(cell, 9),
    ...neighbours.map(n => new NFA(justified, 'chain', cell, n, ck.at(n))),
  ]));

  // Reverse, base case: digit==9 forces CK(cell) TRUE.
  chainConstraints.push(new Or([
    new Given(cell, 1, 2, 3, 4, 5, 6, 7, 8),
    new Given(cellCk, TRUE),
  ]));

  // Reverse, neighbour case: any one genuinely-justifying neighbour forces
  // CK(cell) TRUE.
  for (const n of neighbours) {
    chainConstraints.push(new Or([
      new NFA(notJustified, 'chain', cell, n, ck.at(n)),
      new Given(cellCk, TRUE),
    ]));
  }

  // The stated rule: every 1 needs a genuine chain to 9.
  chainConstraints.push(new Or([
    new Given(cell, 2, 3, 4, 5, 6, 7, 8, 9),
    new Given(cellCk, TRUE),
  ]));
}

return [
  new Shape('9x9'),
  ck.toVar('chain OK'),
  ...givens,
  ...chainConstraints,
];
