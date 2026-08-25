// Title: Yin-Yang Sudoku
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=qyM_aI4JTZM
// Source: https://app.crackingthecryptic.com/sudoku/GHr3MNpNBd

// Normal sudoku rules apply. Shading is the YinYang constraint's YY cell
// group (two orthogonally-connected regions, no monochrome 2x2). Numbers
// outside the grid give the sum of the digits in the grey (shaded) cells of
// that row/column.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('YY');

// Outside grey-sum clues (drawn numbers outside the grid): sum of the digits
// in the grey (shaded) cells of that row/column. Row clues are on the left,
// column clues on top.
const outsideClues = [
  { cells: graph.row(1), target: 7 },
  { cells: graph.row(2), target: 12 },
  { cells: graph.row(3), target: 17 },
  { cells: graph.row(5), target: 17 },
  { cells: graph.row(7), target: 27 },
  { cells: graph.row(8), target: 8 },
  { cells: graph.row(9), target: 27 },
  { cells: graph.column(2), target: 13 },
  { cells: graph.column(3), target: 38 },
  { cells: graph.column(4), target: 22 },
  { cells: graph.column(6), target: 14 },
  { cells: graph.column(7), target: 24 },
  { cells: graph.column(8), target: 9 },
];

// One NFA per clued line, scanning [shade, digit] pairs interleaved cell by
// cell so each digit is read together with its own cell's shade; state
// tracks a running sum of digits whose shade is SHADED, clamped once it
// cannot equal the target.
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
  new YinYang(),
  ...outsideSumConstraints,
];
