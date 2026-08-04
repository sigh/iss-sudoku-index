// Title: Taiji Garden
// Author: Darren Nakamura
// Video: https://www.youtube.com/watch?v=FQdIT1B97HQ
// Source: https://app.crackingthecryptic.com/sudoku/QnHn8jPDqT

// Normal sudoku rules apply (default rows/cols/boxes). Shade cells so that the
// shaded cells and the unshaded cells each form a single orthogonally connected
// area, with no 2x2 block fully shaded or fully unshaded (a Yin-Yang shading).
// A Taiji-flower cell's own digit equals how many of its (up to four) orthogonal
// neighbors share its own shade. Numbers outside the grid give the sum of the
// digits in the shaded cells of that row/column.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Every shade Var is either shaded or unshaded.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, SHADED, UNSHADED));

// No 2x2 block may be all shaded or all unshaded: one NFA on the top-left
// block, replicated to every block origin.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    const allSame = next.every(v => v === next[0]);
    return allSame ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

// Taiji flower cells (drawn flower icons), listed top-to-bottom/left-to-right.
const taijiFlowerCells = [
  'R1C1', 'R1C2', 'R1C9', 'R2C2', 'R2C8', 'R3C6', 'R4C4', 'R4C5', 'R5C8',
  'R6C1', 'R6C4', 'R6C9', 'R7C3', 'R7C6', 'R8C2', 'R8C6', 'R8C8', 'R9C1',
];

// A Taiji flower's own digit = count of its orthogonal neighbors sharing its
// shade. Enumerated directly (own shade x each neighbor's shade, <=4
// neighbors so <=32 branches) rather than derived algebraically, since the
// count depends on the cell's own (unknown) shade as well as its neighbors'.
// Combinations where no neighbor matches are omitted: they would require
// digit 0, outside the 1-9 grid alphabet, so they can never be satisfied and
// carry no branch.
function taijiFlowerConstraint(flowerCell) {
  const neighborCells = graph.neighbours(flowerCell);
  const ownShadeCell = shade.at(flowerCell);
  const neighborShadeCells = shade.at(neighborCells);
  const k = neighborCells.length;
  const branches = [];
  for (const ownVal of [SHADED, UNSHADED]) {
    for (let mask = 0; mask < (1 << k); mask++) {
      let count = 0;
      const givens = [new Given(ownShadeCell, ownVal)];
      for (let i = 0; i < k; i++) {
        const val = (mask & (1 << i)) ? SHADED : UNSHADED;
        if (val === ownVal) count++;
        givens.push(new Given(neighborShadeCells[i], val));
      }
      if (count === 0) continue;
      givens.push(new Given(flowerCell, count));
      branches.push(new And(givens));
    }
  }
  return new Or(branches);
}
const taijiConstraints = taijiFlowerCells.map(taijiFlowerConstraint);

// Outside shaded-sum clues (drawn numbers outside the grid): sum of the
// digits in the shaded cells of that row/column.
const outsideClues = [
  { cells: graph.row(3), target: 20 },
  { cells: graph.row(7), target: 25 },
  { cells: graph.row(8), target: 22 },
  { cells: graph.column(4), target: 20 },
  { cells: graph.column(5), target: 17 },
  { cells: graph.column(6), target: 24 },
  { cells: graph.column(9), target: 20 },
];

// One NFA per clued line, scanning [shade, digit] pairs interleaved cell by
// cell so each digit is read together with its own cell's shade; state tracks
// a running sum of digits whose shade is SHADED, clamped once it cannot equal
// the target.
function outsideSumConstraint(lineCells, target) {
  const seq = lineCells.flatMap(cell => [shade.at(cell), cell]);
  const spec = NFA.encodeSpec({
    startState: { expect: 'shade', pending: null, sum: 0 },
    transition: (state, value) => {
      if (state.expect === 'shade') {
        return { expect: 'digit', pending: value, sum: state.sum };
      }
      const add = state.pending === SHADED ? value : 0;
      return {
        expect: 'shade',
        pending: null,
        sum: Math.min(state.sum + add, target + 1),
      };
    },
    accept: (state) => state.expect === 'shade' && state.sum === target,
  }, geometry.numValues);
  return new NFA(spec, `outside-sum-${target}`, seq);
}
const outsideSumConstraints = outsideClues.map(
  ({ cells, target }) => outsideSumConstraint(cells, target));

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  // Yin-Yang connectivity: each shade forms one orthogonally connected region.
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...taijiConstraints,
  ...outsideSumConstraints,
];
