// Title: The Ancient Wall Example Puzzle
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=TRWcPWXIPxs
// Source: https://app.crackingthecryptic.com/sudoku/62HMGR8RNN

// Normal sudoku rules apply (6x6 default boxes, 2 rows x 3 columns). The grid
// is divided into two sets of contiguous cells: an unknown per-cell binary
// partition on the 'VS' overlay, closed by ConnectedValues on each side so
// both sets are single orthogonally-connected regions. A circled cell's digit
// equals the count of cells in its own row and column combined (excluding
// itself) that lie in the OTHER set. Not every circle carries a given digit;
// the rule is enforced regardless, against whichever digit solving places
// there.

const SET_A = 1;
const SET_B = 2;

const graph = cellGraph('6x6');
const region = graph.makeOverlay('VS');

// Every region cell is one of the two sets.
const regionDomain = region.makeReplicate(
  new Given(region.cells()[0], SET_A, SET_B));

// The rules never name which of the two sets is which, so SET_A/SET_B is a
// label the solver is free to swap end-to-end -- a symmetry, not a puzzle
// fact. Pin R1C1's set to break it, leaving one canonical labelling.
const breakLabelSymmetry = new Given(region.at('R1C1'), SET_A);

// Circled cells: the drawn white circle marks (12 of them). R2C2's given
// digit sits on a plain, uncircled cell and is not included here.
const circledCells = [
  'R1C1', 'R1C2', 'R1C6',
  'R2C6',
  'R3C2', 'R3C6',
  'R4C5', 'R4C6',
  'R6C2', 'R6C3', 'R6C4', 'R6C5',
];

// Countdown state machine, shared by every circled cell. Segments: [this
// cell's digit, this cell's own set], then the rest of its row, then the rest
// of its column (SEGMENT_BREAK between, ignored so the countdown carries
// across both). The first read sets the target quota from the digit; the
// second sets "own" from the cell's own set; every following read decrements
// the quota once per row/column cell whose set differs from "own". Accepts
// when the quota reaches exactly zero once every row/column cell is scanned.
const spec = NFA.encodeSpec({
  startState: { quota: null, own: null },
  transition: ({ quota, own }, value) => {
    if (quota === null) return { quota: value, own: null };
    if (own === null) return { quota, own: value };
    if (value === SEGMENT_BREAK) return { quota, own };
    return { quota: quota - (value !== own ? 1 : 0), own };
  },
  accept: ({ quota, own }) => quota === 0 && own !== null,
  // 2 origin reads + 5 row + 5 col cells, plus 2 SEGMENT_BREAKs (3 segments).
  maxDepth: 14,
}, 6, { multiSegment: true });

const circleCounts = circledCells.map(cell => {
  const rowRest = graph.row(cell).filter(c => c !== cell);
  const colRest = graph.column(cell).filter(c => c !== cell);
  return new NFA(
    spec, 'circle-count',
    [cell, region.at(cell)],
    region.at(rowRest),
    region.at(colRest));
});

return [
  new Shape('6x6'),
  new Given('R1C1', 1),
  new Given('R1C6', 6),
  new Given('R2C2', 2),
  new Given('R6C2', 3),
  region.toVar('region'),
  regionDomain,
  breakLabelSymmetry,
  new ConnectedValues('VS', SET_A),
  new ConnectedValues('VS', SET_B),
  ...circleCounts,
];
