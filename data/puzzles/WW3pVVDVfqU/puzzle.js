// Title: Repetition Legitimizes
// Author: gdc
// Video: https://www.youtube.com/watch?v=WW3pVVDVfqU
// Source: https://sudokupad.app/i2r7za43kv

// Rules encoded here:
//   DECONSTRUCTION  nine non-overlapping 3x3 boxes sit somewhere in the 11x11
//                   grid ("non-overlapping" only -- unlike some Deconstruction
//                   variants there is no no-touching requirement). Each box
//                   holds 1-9 once; digits do not repeat in a row or column. A
//                   cell outside every box is blank, and its value for the
//                   Whisper Loop / Palindrome rules below is 0.
//   WHISPER LOOP    the solver draws a loop through the centres of some cells,
//                   moving orthogonally; it may touch itself diagonally but not
//                   orthogonally, and adjacent values along it differ by >= 5.
//                   Its path is nowhere pre-drawn, matching the rule's "draw a
//                   loop" phrasing -- it is solver-discovered.
//   CIRCLES         six drawn circles are on the loop and inside a box; a
//                   circle's digit counts how many of its box's 9 cells are on
//                   the loop.
//   PALINDROMES     cells equidistant from a line's circled centre share a
//                   value. Two lines are drawn. Their cells are disjoint from
//                   the six circle cells above, so these are a separate,
//                   fixed pair of lines, not a rendering of the (undrawn)
//                   loop; each line's circle overlay sits exactly at its
//                   cell-count midpoint (index 3 of 7, and the mid-edge of an
//                   8-cell line), matching "the circled centre of a line".
// Fog is presentation only and is not encoded.
//
// The answer cannot live in the ISS main grid: an 11x11 row can hold up to 11
// blank cells, and main-grid rows are always all-different -- too small for 9
// digits plus distinct blank fillers. The grid instead lives on Var layers
// over an 11x11 cell graph:
//   VD  each cell's value: 0 if blank, else its digit 1-9
//   VL  each cell's position inside its box: 0 if blank, else 1 + 3*rowOffset +
//       colOffset for offsets 0-2
//   VO  each cell's loop membership: 1 = on the loop, 2 = off
// The main grid still has to exist at 11x11 (unlike a puzzle with no free-form
// connected region, the Whisper Loop's connectivity check requires its Var
// layer to be exactly as large as the main grid), so it is pinned to a fixed
// cyclic Latin square that adds no search of its own, with boxes dropped.
// Values run 0-10 (11 of them) only because that Latin square needs 11
// distinct fillers; 10 is never available to VD, VL, or VO.
const SIZE = 11;
const shape = new Shape('11x11', '0-10');
const grid = cellGraph('11x11');
const value = grid.makeOverlay('VD');
const label = grid.makeOverlay('VL');
const loop = grid.makeOverlay('VO');
const valueVars = value.toVar('Values');
const labelVars = label.toVar('Box labels');
const loopVars = loop.toVar('Loop');

const ON = 1;
const OFF = 2;

// ---- Deconstruction: nine non-overlapping 3x3 boxes. VL steps by 1
// rightwards and by 3 downwards inside a box; at a box's trailing edge (or
// outside any box) the next cell either is blank or starts a new box.
const rowOffset = a => ((a - 1) / 3) | 0;
const colOffset = a => (a - 1) % 3;

const labelAcross = Pair.fnToKey((a, b) =>
  a === 0 ? (b === 0 || colOffset(b) === 0)
    : colOffset(a) < 2 ? b === a + 1
      : (b === 0 || colOffset(b) === 0), shape);
const labelDown = Pair.fnToKey((a, b) =>
  a === 0 ? (b === 0 || rowOffset(b) === 0)
    : rowOffset(a) < 2 ? b === a + 3
      : (b === 0 || rowOffset(b) === 0), shape);
// A cell is blank exactly when it lies in no box.
const emptyIff = Pair.fnToKey((d, l) => (d === 0) === (l === 0), shape);
// No row or column repeats a digit; blank cells (0) are exempt.
const noRepeat = PairX.fnToKey((a, b) => a === 0 || b === 0 || a !== b, shape);

const labelRuns = [
  ...grid.rows().map((cells, i) => new Pair(labelAcross, `across${i + 1}`, ...label.at(cells))),
  ...grid.columns().map((cells, i) => new Pair(labelDown, `down${i + 1}`, ...label.at(cells))),
];
// A box cannot run off the grid, so the border rows/columns can only hold the
// labels of a box's leading or trailing edge.
const labelBorders = [
  ...label.at(grid.row(1)).map(c => new Given(c, 0, 1, 2, 3)),
  ...label.at(grid.row(11)).map(c => new Given(c, 0, 7, 8, 9)),
  ...label.at(grid.column(1)).map(c => new Given(c, 0, 1, 4, 7)),
  ...label.at(grid.column(11)).map(c => new Given(c, 0, 3, 6, 9)),
];
const emptyLinks = grid.cells().map(
  c => new Pair(emptyIff, 'empty', value.at(c), label.at(c)));
// Exactly nine cells carry label 1, i.e. there are exactly nine boxes.
const nineBoxes = new ContainExact(Array(9).fill(1).join('_'), ...label.cells());

// Wherever a box starts (label 1), its nine cells are non-blank (emptyLinks)
// and all different, which over a 9-value domain forces them to be 1-9.
const boxDigits = grid.cells().flatMap(topLeft => {
  const block = grid.block(topLeft, 3, 3);
  if (block === null) return [];
  return [new Or([
    new Given(label.at(topLeft), 0, 2, 3, 4, 5, 6, 7, 8, 9),
    new AllDifferent(...value.at(block))])];
});

const rowsAndCols = [
  ...grid.rows().map((cells, i) => new PairX(noRepeat, `row${i + 1}`, ...value.at(cells))),
  ...grid.columns().map((cells, i) => new PairX(noRepeat, `col${i + 1}`, ...value.at(cells))),
];

// ---- Whisper Loop: an unknown single loop. Since it may not touch itself
// orthogonally, any two orthogonally-adjacent on-loop cells are a real used
// edge of the loop, so plain ON/OFF membership + a degree-2 NFA over
// orthogonal neighbours + ConnectedValues for a single region fully capture
// it -- no extra no-diagonal-touch machine, since diagonal touch is
// explicitly legal here.
const originCell = loop.cells()[0];
const membership = loop.makeReplicate(new Given(originCell, ON, OFF));

const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, m) => {
    if (phase === 'start') {
      return m === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (m === ON ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === 2,
}, shape);
// Every interior cell (row and column 2-10) has the same four-neighbour shape,
// so their degree NFAs are one shifted template: Replicate anchors at R2C2
// (delta (1,1) from the overlay origin R1C1) and shifts it across the matching
// top-left 9x9 block of target cells, which maps R1C1..R9C9 onto R2C2..R10C10.
// Border cells have fewer neighbours and stay individual NFAs.
const degreeOrigin = 'R2C2';
const degreeTemplate = new NFA(degreeMachine, 'degree',
  ...loop.at([degreeOrigin, ...grid.neighbours(degreeOrigin)]));
const interiorDegree = loop.makeReplicate(degreeTemplate, loop.at(grid.block('R1C1', 9, 9)));
const borderDegrees = grid.cells()
  .filter(cell => {
    const { row, col } = parseCellId(cell);
    return row === 1 || row === 11 || col === 1 || col === 11;
  })
  .map(cell => new NFA(degreeMachine, 'degree', ...loop.at([cell, ...grid.neighbours(cell)])));
const degrees = [interiorDegree, ...borderDegrees];

// Whisper: adjacent VALUES along the loop differ by >= 5. Reads
// (membership, value) for each orthogonally stepped pair (right/down only, so
// each edge is covered once); a pair is unconstrained unless both cells are on
// the loop.
const whisperMachine = NFA.encodeSpec({
  startState: { phase: 'aOn' },
  transition: (state, v) => {
    switch (state.phase) {
      case 'aOn':
        return v === ON ? { phase: 'aValue' } : { phase: 'skip', left: 3 };
      case 'aValue':
        return { phase: 'bOn', aValue: v };
      case 'bOn':
        return v === ON
          ? { phase: 'bValue', aValue: state.aValue }
          : { phase: 'skip', left: 1 };
      case 'bValue':
        return Math.abs(state.aValue - v) >= 5 ? { phase: 'done' } : undefined;
      case 'skip':
        return state.left > 1 ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, shape);
const whispers = grid.cells().flatMap(cell => [[0, 1], [1, 0]]
  .map(([dR, dC]) => grid.step(cell, dR, dC))
  .filter(Boolean)
  .map(other => new NFA(whisperMachine, 'whisper',
    loop.at(cell), value.at(cell), loop.at(other), value.at(other))));

// ---- Circles: six drawn circles (the 0.85x0.85 grey-bordered overlays) are on
// the loop and inside a box; a circle's digit counts loop cells in its box.
const CIRCLES = ['R1C1', 'R2C4', 'R5C4', 'R5C6', 'RbC3', 'R5C9'];
const circlesOnLoop = CIRCLES.map(c => new Given(loop.at(c), ON));
const circlesInBox = CIRCLES.map(c => new Given(label.at(c), 1, 2, 3, 4, 5, 6, 7, 8, 9));

// Reads the circle's digit, then its box's nine cells' loop membership in
// order, and accepts iff the digit equals the count of ON cells among them.
const countMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: (state, v) => {
    if (state.phase === 'start') return { phase: 'count', target: v, count: 0, seen: 0 };
    const seen = state.seen + 1;
    const count = state.count + (v === ON ? 1 : 0);
    return { phase: 'count', target: state.target, count, seen };
  },
  accept: (s) => s.phase === 'count' && s.seen === 9 && s.count === s.target,
  maxDepth: 10,
}, shape);

// The box containing a circle is not known in advance, so for each circle this
// enumerates every label value the circle's own cell could carry (1-9, offset
// by that label's box position); at most one is the box actually placed there.
// Each candidate is "if this cell's label isn't L, no constraint; otherwise the
// count must match" -- the same conditional-Or pattern as boxDigits above.
const circleCounts = CIRCLES.flatMap(cell => {
  const { row, col } = parseCellId(cell);
  const branches = [];
  for (let l = 1; l <= 9; l++) {
    const topLeftRow = row - rowOffset(l);
    const topLeftCol = col - colOffset(l);
    if (topLeftRow < 1 || topLeftRow > 9 || topLeftCol < 1 || topLeftCol > 9) continue;
    const block = grid.block(makeCellId(topLeftRow, topLeftCol), 3, 3);
    if (block === null) continue;
    const otherLabels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(x => x !== l);
    branches.push(new Or([
      new Given(label.at(cell), ...otherLabels),
      new NFA(countMachine, `circle${cell}L${l}`, value.at(cell), ...loop.at(block)),
    ]));
  }
  return branches;
});

// ---- Palindromes: two drawn lines, transcribed from their wayPoints
// (interpolated through the cells they pass) in drawn order. Cells equidistant
// from each line's circled centre hold the same value; Palindrome pairs from
// both ends inward, matching an odd-length line's single centre cell and an
// even-length line's centre-edge pair.
const LINE_A = ['R3C5', 'R4C5', 'R5C5', 'R6C5', 'R6C4', 'R7C3', 'R7C2'];
const LINE_B = ['RaC7', 'R9C7', 'R8C8', 'R7C8', 'R6C8', 'R6C9', 'R6Ca', 'R6Cb'];
const palindromes = [
  new Palindrome(...value.at(LINE_A)),
  new Palindrome(...value.at(LINE_B)),
];

// The main grid holds nothing real: pin it to the cyclic Latin square
// value = row + col (mod SIZE), which trivially satisfies row/column
// all-different and needs no boxes.
const filler = grid.cells().map(cell => {
  const { row, col } = parseCellId(cell);
  return new Given(cell, (row - 1 + col - 1) % SIZE);
});

return [
  shape,
  new NoBoxes(),
  ...filler,
  valueVars,
  labelVars,
  loopVars,
  ...labelRuns,
  ...labelBorders,
  ...emptyLinks,
  nineBoxes,
  ...boxDigits,
  ...rowsAndCols,
  membership,
  ...degrees,
  new ConnectedValues('VO', ON),
  ...whispers,
  ...circlesOnLoop,
  ...circlesInBox,
  ...circleCounts,
  ...palindromes,
];
