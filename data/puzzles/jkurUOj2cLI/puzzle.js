// Title: Untitled
// Author: Unknown
// Video: https://www.youtube.com/watch?v=jkurUOj2cLI
// Source: https://app.crackingthecryptic.com/sudoku/49hn7rHbDp

// Normal sudoku (9x9, standard boxes) on the playable core of the source
// canvas -- the surrounding 3-cell L-shaped border carries only the outside
// sum clues below and is not modelled as grid cells.
//
// Rules: some cells are coloured blue; all blue cells form one orthogonally
// connected group; no 2x2 area is entirely blue; outside each row/column, in
// order, are the sums of the digits in each maximal run of blue cells that
// row/column contains, and every run in the line is listed (the clue list
// pins the line's blue cells exactly, with no run left over). The clue slots
// are packed against the grid edge (an all-grey source cell means "no run
// here", never "run sums to zero"), which leaves the reading direction open
// on the rules text alone: does the slot nearest the grid hold the first run
// (scanning in from that edge) or the last? Both readings were built and
// solved; "nearest = first" is unsatisfiable (exhaustive 0-solution search,
// with or without the connectivity/no-2x2 rules, and also for either
// row-first/col-last or row-last/col-first mixed reading), while "nearest =
// last" (the run closest to the far edge of the line is listed first,
// mirroring standard outside-clue run lists) has solutions. Encoded as
// "nearest = last" on that ground, since the puzzle is a published, solved
// CTC puzzle and so must have an admissible reading.
//
// The blue/not-blue split here is *not* full Yin-Yang: only blue cells are
// required connected, and only all-blue 2x2 blocks are forbidden (the rules
// text says nothing about the unshaded cells), so this uses one
// ConnectedValues plus a blue-only no-mono-2x2 NFA rather than the YinYang
// class, which would also force the unshaded cells connected and forbid an
// all-unshaded 2x2 -- constraints this puzzle does not state.

const BLUE = 1;
const UNBLUE = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VBL');
const shadeCell = cell => shade.at(cell);
const gridCells = graph.cells();

const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], BLUE, UNBLUE));

// No 2x2 block may be all blue (the complementary all-unblue case is not a
// rule here, so this checks only one direction, unlike a full yin-yang
// no-mono-2x2 check).
const no4BlueMachine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    const allBlue = next.every(v => v === BLUE);
    return allBlue ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const no4Blue = shade.makeReplicate(
  new NFA(no4BlueMachine, 'no-4-blue',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

// Build every placement of `sums.length` maximal blue runs along `cells`
// (ordered from the clue-adjacent end inward), each run's digits summing to
// its target, separated by >=1 unblue cell, with any leading/trailing slack
// forced unblue. Returns an array of And-branches; exactly one branch
// matches the true shading of a valid solution, so the caller wraps this in
// Or. This generalizes a single-run "first block" window search to an exact,
// ordered sequence of runs.
function runPlacements(sums, cells) {
  if (sums.length === 0) {
    return [cells.map(cell => new Given(shadeCell(cell), UNBLUE))];
  }
  const [sum, ...restSums] = sums;
  const branches = [];
  for (let start = 0; start < cells.length; start++) {
    const prefix = cells.slice(0, start)
      .map(cell => new Given(shadeCell(cell), UNBLUE));
    for (let end = start; end < cells.length; end++) {
      const run = cells.slice(start, end + 1);
      const runGivens = run.map(cell => new Given(shadeCell(cell), BLUE));
      const sumC = new Sum(sum, ...run);
      let restCells = cells.slice(end + 1);
      let gapGiven = [];
      if (restSums.length > 0) {
        if (restCells.length === 0) continue; // no room for the mandatory gap + next run
        gapGiven = [new Given(shadeCell(restCells[0]), UNBLUE)];
        restCells = restCells.slice(1);
      }
      for (const sub of runPlacements(restSums, restCells)) {
        branches.push([...prefix, ...runGivens, sumC, ...gapGiven, ...sub]);
      }
    }
  }
  return branches;
}

const orderedRunsSum = (sums, cells) =>
  new Or(runPlacements(sums, cells).map(branch => new And(branch)));

// Outside clue sums, transcribed from the overlay text and listed first run
// to last, per the direction settled above (nearest-to-grid slot = last
// run, so the far-to-near order in the source becomes first-to-last here).
// Row clues sit left of the grid (raw columns C1-C3, nearest = C3);
// column clues sit above it (raw rows R1-R3, nearest = R3). Rows/columns
// with fewer than 3 runs have the far slot(s) shaded grey in the source
// (no clue) -- omitted here, not zero.
const rowSums = {
  1: [13],
  2: [3, 25],
  3: [4, 24, 3],
  4: [1, 2, 6],
  5: [26, 8],
  6: [2, 12, 4],
  7: [2, 7, 6],
  8: [14, 14],
  9: [20, 7],
};
const colSums = {
  1: [5, 10, 6],
  2: [2, 6, 7],
  3: [18, 8, 8],
  4: [23, 6],
  5: [6, 1, 11],
  6: [11, 18],
  7: [6, 2, 4],
  8: [2, 5, 16],
  9: [22],
};

const rowClues = Object.entries(rowSums).map(
  ([r, sums]) => orderedRunsSum(sums, graph.row(+r)));
const colClues = Object.entries(colSums).map(
  ([c, sums]) => orderedRunsSum(sums, graph.column(+c)));

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  new ConnectedValues('VBL', BLUE),
  no4Blue,
  ...rowClues,
  ...colClues,
];
