// Title: The Path Through Life
// Author: Tobias
// Video: https://www.youtube.com/watch?v=sTCDUAiuslk
// Source: https://app.crackingthecryptic.com/TQdQfrd2HB

// Normal sudoku rules apply. Draw a 1-cell wide path across life. The path does
// not branch and does not touch itself orthogonally. Start in one of the cages,
// visiting the hidden letters E and M there in that order. Continue the path into
// the other cage, visiting V and A (in that order) before returning to the first
// region visiting M again. Letters each represent a different digit, and any
// letter shown in the grid is not on the path. The path leaves exactly one region
// of each of sizes 2,3,4,5,6,7 and 8 behind. If a circle is on the path, its digit
// says how many path-cells it "sees" (counting itself - non-path cells block the
// view), and if a circle is off the path it says how big its non-path region is.
// Along the path, a blue square indicates a pair of digits summing to 10 whereas
// in the areas not on the path it indicates a pair of digits summing to 5. No blue
// square is only partially on the path.
//
// OMITTED: the order of the letter visits along the path (E then M in the cage the
// path starts in, then V then A in the other cage, then M again back in the first
// cage). What is encoded instead is the unordered residue of those two sentences:
// one path end lies in the first cage, that cage holds a path cell with digit E and
// two path cells with digit M, and the other cage holds path cells with digits V
// and A. Everything else in the rules is encoded.

const PATH = 1;                             // VP: the cell is on the path
const OFF_SIZES = [2, 3, 4, 5, 6, 7, 8];    // VP: off-path cell, labelled by the
                                            // size of the region it belongs to
const OFF = 1, ENDPOINT = 2, THROUGH = 3;   // VE: path degree, code = degree + 1

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;
const gridCells = graph.cells();

// Drawn geometry, transcribed from the puzzle's art.
// White circles at cell centres:
const circles = ['R1C3', 'R1C5', 'R2C4', 'R2C7', 'R4C3',
  'R6C1', 'R7C4', 'R7C7', 'R9C3', 'R9C9'];
// Blue squares, each on the border between the two cells named:
const blueSquares = [
  ['R1C7', 'R2C7'], ['R1C8', 'R1C9'], ['R2C4', 'R2C5'], ['R3C2', 'R4C2'],
  ['R4C1', 'R5C1'], ['R4C3', 'R4C4'], ['R4C6', 'R5C6'], ['R4C7', 'R5C7'],
  ['R5C9', 'R6C9'], ['R7C2', 'R7C3'], ['R7C4', 'R7C5'], ['R7C9', 'R8C9'],
  ['R8C1', 'R9C1'], ['R9C2', 'R9C3'], ['R9C6', 'R9C7'],
];
// The two totalless cages. They carry no digit rule; the rules use them only as
// the areas the letter visits happen in.
const cages = [
  ['R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C4', 'R2C5', 'R2C6', 'R2C7'],
  ['R7C3', 'R7C4', 'R8C3', 'R8C4', 'R9C3', 'R9C4'],
];
// Printed letters; M is printed twice, so the two M cells hold one digit.
const letterCell = { E: 'R6C9', M: 'R5C9', V: 'R9C9', A: 'R1C1' };
const secondMCell = 'R6C3';

// Path membership and off-path region labels share one overlay: an off-path cell
// carries its own region's size, which is what an off-path circle reads.
const path = graph.makeOverlay('VP');
// Degree overlay, so that "exactly two path ends" is a count over one group.
const degree = graph.makeOverlay('VE');

// Sight-line run lengths, built only over the rows and columns that hold a
// circle, since no other cell's runs are read.
const rowsWithCircle = new Set(circles.map(cell => parseCellId(cell).row));
const colsWithCircle = new Set(circles.map(cell => parseCellId(cell).col));
const horizontalCells = gridCells.filter(c => rowsWithCircle.has(parseCellId(c).row));
const verticalCells = gridCells.filter(c => colsWithCircle.has(parseCellId(c).col));
const runUp = graph.makeOverlay('VU', verticalCells);
const runDown = graph.makeOverlay('VD', verticalCells);
const runLeft = graph.makeOverlay('VL', horizontalCells);
const runRight = graph.makeOverlay('VR', horizontalCells);

// --- The path -------------------------------------------------------------

// Degree: reads [VE(cell), VP(cell), VP(neighbour)...]. The code is OFF exactly
// when the cell is off the path, and otherwise names the number of orthogonal
// neighbours that are on the path (1 for an end, 2 for a through-cell). Because
// the path never touches itself orthogonally, that neighbour count is the cell's
// degree along the path, so codes 2 and 3 are the whole of "does not branch and
// does not touch itself orthogonally".
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'code' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'code':
        return { phase: 'member', code: value };
      case 'member': {
        const onPath = value === PATH;
        if (onPath !== (state.code !== OFF)) return undefined;
        return { phase: 'count', want: onPath ? state.code - 1 : null, count: 0 };
      }
      case 'count': {
        // An off-path cell's neighbours are unconstrained, so nothing is counted
        // for it - the compiler explores states blind to the input length, and a
        // running count with no bound would not terminate.
        if (state.want === null) return { phase: 'count', want: null, count: 0 };
        const count = state.count + (value === PATH ? 1 : 0);
        return count > state.want ? undefined : { phase: 'count', want: state.want, count };
      }
    }
  },
  accept: (state) =>
    state.phase === 'count' && (state.want === null || state.count === state.want),
}, numValues);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'degree',
  degree.at(cell), ...path.at([cell, ...graph.neighbours(cell)])));

// --- Off-path regions -----------------------------------------------------

// Two adjacent off-path cells are in the same region, so they must carry the same
// label: this is what makes the labelled classes the actual connected components
// of the off-path area rather than an arbitrary cut of it.
const sameRegionKey = Pair.fnToKey(
  (a, b) => a === PATH || b === PATH || a === b, numValues);
const regionOrigin = path.cells()[0];
const regionEdges = [[0, 1], [1, 0]].map(([dRow, dCol]) => path.makeReplicate(
  new Pair(sameRegionKey, 'region',
    regionOrigin, path.step(regionOrigin, dRow, dCol)),
  path.cells().filter(varCell => path.step(varCell, dRow, dCol) !== null)));

// --- Sight lines ----------------------------------------------------------

// run(cell) counts the path cells from `cell` back along one direction, `cell`
// included, and is pinned to 1 on an off-path cell so no free value is left.
// Reads [VP(previous), run(previous), VP(cell), run(cell)].
const runMachine = NFA.encodeSpec({
  startState: { phase: 'prevMember' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'prevMember':
        return { phase: 'prevRun', prevOnPath: value === PATH };
      case 'prevRun':
        return { phase: 'member', prevRun: state.prevOnPath ? value : 0 };
      case 'member': {
        const want = value === PATH ? state.prevRun + 1 : 1;
        return want > numValues ? undefined : { phase: 'run', want };
      }
      case 'run':
        return value === state.want ? { phase: 'done' } : undefined;
    }
  },
  accept: (state) => state.phase === 'done',
}, numValues);
// The first cell each way has no predecessor, so its run is 1 outright.
const runChain = (overlay, dRow, dCol) => overlay.cells().map(varCell => {
  const cell = overlay.gridAt(varCell);
  const previous = graph.step(cell, dRow, dCol);
  const previousVar = previous === null ? null : overlay.at(previous);
  return previousVar === null
    ? new Given(varCell, 1)
    : new NFA(runMachine, 'run',
      path.at(previous), previousVar, path.at(cell), varCell);
});

// --- Circles --------------------------------------------------------------

// The four runs each count the circle itself, hence the -3.
const circleConstraints = circles.map(cell => new Or([
  new And([
    new Given(path.at(cell), PATH),
    new Sum(3, runUp.at(cell), runDown.at(cell),
      runLeft.at(cell), runRight.at(cell), [cell, -1]),
  ]),
  new And([
    new Given(path.at(cell), ...OFF_SIZES),
    // An off-path VP label is the region's size, which is the clue.
    new SameValues(2, cell, path.at(cell)),
  ]),
]));

// --- Blue squares ---------------------------------------------------------

const squareConstraints = blueSquares.map(([a, b]) => new Or([
  new And([new Given(path.at(a), PATH), new Given(path.at(b), PATH), new X(a, b)]),
  new And([
    new Given(path.at(a), ...OFF_SIZES), new Given(path.at(b), ...OFF_SIZES),
    new V(a, b),
  ]),
]));

// --- Letters --------------------------------------------------------------

const letterConstraints = [
  new AllDifferent(letterCell.E, letterCell.M, letterCell.V, letterCell.A),
  new SameValues(2, letterCell.M, secondMCell),
  ...[letterCell.E, letterCell.M, letterCell.V, letterCell.A, secondMCell]
    .map(cell => new Given(path.at(cell), ...OFF_SIZES)),
];

// --- Letter visits (unordered residue; see OMITTED above) -----------------

// Reads [letter cell, then (VP, digit) for each cage cell] and counts the cage
// cells that are on the path and hold the letter's digit, requiring at least
// `minCount` of them. The letter's value is read off the printed cell, so the
// machine carries it as state rather than as a literal.
const visitMachine = (minCount) => NFA.encodeSpec({
  startState: { phase: 'letter' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'letter':
        return { phase: 'member', letter: value, count: 0 };
      case 'member':
        return {
          phase: 'digit', letter: state.letter, count: state.count,
          onPath: value === PATH,
        };
      case 'digit': {
        const hit = state.onPath && value === state.letter;
        return {
          phase: 'member', letter: state.letter,
          count: Math.min(state.count + (hit ? 1 : 0), minCount),
        };
      }
    }
  },
  accept: (state) => state.phase === 'member' && state.count >= minCount,
}, numValues);
const visitsOnce = visitMachine(1);
const visitsTwice = visitMachine(2);
const cageScan = (cage) => cage.flatMap(cell => [path.at(cell), cell]);
const visitBranch = (first, second) => new And([
  // "Start in one of the cages": one end of the path lies in that cage.
  new ContainAtLeast(String(ENDPOINT), ...degree.at(first)),
  new NFA(visitsOnce, 'visit-E', letterCell.E, ...cageScan(first)),
  new NFA(visitsTwice, 'visit-M', letterCell.M, ...cageScan(first)),
  new NFA(visitsOnce, 'visit-V', letterCell.V, ...cageScan(second)),
  new NFA(visitsOnce, 'visit-A', letterCell.A, ...cageScan(second)),
]);

return [
  new Shape('9x9'),
  path.toVar('path'),
  degree.toVar('degree'),
  runUp.toVar('run-up'),
  runDown.toVar('run-down'),
  runLeft.toVar('run-left'),
  runRight.toVar('run-right'),

  new Given('R4C8', 5),
  new Given('R5C2', 5),

  path.makeReplicate(new Given(path.cells()[0], PATH, ...OFF_SIZES)),
  degree.makeReplicate(new Given(degree.cells()[0], OFF, ENDPOINT, THROUGH)),

  // The path is one orthogonally-connected set; with every path cell of degree 1
  // or 2 and exactly two of degree 1, that set is a single simple path.
  new ConnectedValues('VP', PATH),
  ...degrees,
  new ContainExact(`${ENDPOINT}_${ENDPOINT}`, ...degree.cells()),

  // Exactly one off-path region of each size 2..8, and nothing else off the path.
  ...OFF_SIZES.map(size => new ConnectedValues('VP', size, size)),
  ...regionEdges,

  ...runChain(runUp, -1, 0),
  ...runChain(runDown, 1, 0),
  ...runChain(runLeft, 0, -1),
  ...runChain(runRight, 0, 1),

  ...circleConstraints,
  ...squareConstraints,
  ...letterConstraints,

  new Or([visitBranch(cages[0], cages[1]), visitBranch(cages[1], cages[0])]),
];
