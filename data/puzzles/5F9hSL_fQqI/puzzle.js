// Title: Coloured Dominoes
// Author: Riokaii
// Video: https://www.youtube.com/watch?v=5F9hSL_fQqI
// Source: https://app.crackingthecryptic.com/sudoku/Jqn4gJJftd

// Rules encoded (video description / metadata.rules):
// - Normal sudoku rules apply.
// - In cages, clues show the difference between the two digits.
// - No two cages with the same difference can touch each other (share an
//   edge), except as regards the question-marked cage, which DOES touch at
//   least one cage with the same difference.
// - Cells joined with a white dot have consecutive digits.
//
// The drawn cages pair every cell but R5C5 (the lone given) into 40
// two-cell "domino" cages -- always an orthogonally-adjacent pair, so each
// cage's own two cells are already forced distinct by the row/column
// all-different rule (a duplicated cage entry for R2C8,R3C8 is deduped in
// the literal list below to the 40 distinct cages). Most cages show a
// numeric difference clue; several show none (still a real cage, its
// difference left free); one, R2C6/R2C7, is marked '?' -- the
// question-marked cage from the rules.
//
// Each cage gets a Var holding its actual (positive) difference, tied to
// its two cells via `D = a-b OR D = b-a` (only the positive solution fits
// D's domain). A numeric clue pins its cage's Var with a Given; an
// unlabeled or '?' cage's Var is left free. Cage adjacency -- "share an
// edge" -- is computed below from the cage cell lists (any cell of one
// orthogonally adjacent to any cell of the other), not hand-enumerated.
// For every adjacent pair not touching the question-marked cage, the two
// difference Vars must differ (AllDifferent). For the question-marked
// cage's adjacent pairs, that blanket rule is exempted instead by an
// explicit disjunction: at least one of its neighbours' Vars equals its
// own.
//
// The two white dots (edge-centred rounded marks, white fill / black
// border -- SudokuPad's Kropki white-dot rendering) each sit on the shared
// edge between two different cages; they are plain WhiteDot constraints,
// independent of the cage/difference machinery.

const cageDefs = [
  // [[cellA, cellB], clue]  clue: number | null (unlabeled) | 'Q' (question-marked)
  [['R1C1', 'R1C2'], 4],
  [['R2C1', 'R3C1'], null],
  [['R2C2', 'R2C3'], null],
  [['R1C3', 'R1C4'], null],
  [['R1C5', 'R1C6'], 1],
  [['R1C7', 'R1C8'], 7],
  [['R1C9', 'R2C9'], 5],
  [['R2C4', 'R3C4'], 6],
  [['R3C2', 'R4C2'], 6],
  [['R3C3', 'R4C3'], null],
  [['R4C4', 'R4C5'], null],
  [['R2C5', 'R3C5'], null],
  [['R2C6', 'R2C7'], 'Q'],
  [['R2C8', 'R3C8'], null],
  [['R3C6', 'R3C7'], 8],
  [['R4C7', 'R4C8'], 5],
  [['R3C9', 'R4C9'], null],
  [['R4C6', 'R5C6'], 7],
  [['R5C4', 'R6C4'], null],
  [['R4C1', 'R5C1'], 8],
  [['R6C2', 'R6C3'], null],
  [['R5C2', 'R5C3'], 5],
  [['R6C1', 'R7C1'], null],
  [['R8C1', 'R9C1'], 1],
  [['R7C2', 'R8C2'], null],
  [['R7C3', 'R8C3'], 6],
  [['R9C2', 'R9C3'], null],
  [['R7C5', 'R8C5'], 7],
  [['R7C4', 'R8C4'], null],
  [['R9C6', 'R9C7'], 7],
  [['R9C4', 'R9C5'], null],
  [['R6C7', 'R7C7'], 2],
  [['R6C5', 'R6C6'], null],
  [['R8C7', 'R8C8'], 1],
  [['R7C6', 'R8C6'], null],
  [['R5C9', 'R6C9'], 4],
  [['R5C7', 'R5C8'], null],
  [['R6C8', 'R7C8'], null],
  [['R7C9', 'R8C9'], null],
  [['R9C8', 'R9C9'], null],
];

const whiteDots = [
  ['R6C2', 'R7C2'],
  ['R8C8', 'R9C8'],
];

const questionIndex = cageDefs.findIndex(([, clue]) => clue === 'Q');

// Difference Var per cage: 'VD1' .. 'VD40'.
const diffVars = new Var('D', 'cage difference', cageDefs.length);
const diffCell = i => diffVars.cell(i + 1);

const diffPinning = cageDefs.map(([[a, b], clue], i) => {
  const d = diffCell(i);
  // D = a-b OR D = b-a, as "one segment sums to another": D's positive
  // domain (Vars use the grid's 1-9 range) selects the correct sign, so D
  // lands on |a-b|.
  const relation = new Or([
    new EqualSum([a], [b, d]),
    new EqualSum([b], [a, d]),
  ]);
  if (typeof clue === 'number') {
    return [relation, new Given(d, clue)];
  }
  return [relation];
});

function cellsAdjacent(a, b) {
  const A = parseCellId(a), B = parseCellId(b);
  return Math.abs(A.row - B.row) + Math.abs(A.col - B.col) === 1;
}
function cagesAdjacent(cellsA, cellsB) {
  return cellsA.some(a => cellsB.some(b => cellsAdjacent(a, b)));
}

const adjacentCagePairs = [];
for (let i = 0; i < cageDefs.length; i++) {
  for (let j = i + 1; j < cageDefs.length; j++) {
    if (cagesAdjacent(cageDefs[i][0], cageDefs[j][0])) {
      adjacentCagePairs.push([i, j]);
    }
  }
}

const noTouchSameDifference = adjacentCagePairs
  .filter(([i, j]) => i !== questionIndex && j !== questionIndex)
  .map(([i, j]) => new AllDifferent(diffCell(i), diffCell(j)));

const questionNeighbours = adjacentCagePairs
  .filter(([i, j]) => i === questionIndex || j === questionIndex)
  .map(([i, j]) => (i === questionIndex ? j : i));

const questionMustMatchOneNeighbour = new Or(
  questionNeighbours.map(n => new SameValues(2, diffCell(questionIndex), diffCell(n)))
);

return [
  new Shape('9x9'),
  new Given('R5C5', 9),
  diffVars,
  ...diffPinning.flat(),
  ...noTouchSameDifference,
  questionMustMatchOneNeighbour,
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
];
