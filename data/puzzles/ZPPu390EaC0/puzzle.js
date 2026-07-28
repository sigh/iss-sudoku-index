// Title: Alto
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=ZPPu390EaC0
// Source: https://sudokupad.app/eb90s76a4e

// Rules encoded: 6x6 Sudoku, two-colour shading with no monochrome toroidal
// 2x2, and the one outside diagonal clue whose starting cell is fixed by the
// rules text. The required toroidal same-colour connectivity and five
// geometrically ambiguous outside clues are deliberately omitted.

const SHADED = 1;
const UNSHADED = 2;
const graph = cellGraph('6x6');
const shade = graph.makeOverlay('VS');
const cells = graph.cells();
const firstShade = shade.cells()[0];

// A four-cell scan accepts every shade pattern except all shaded or all
// unshaded. It is applied to all 36 toroidal 2x2 blocks below.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, 6);

function cell(row, col) {
  return makeCellId(((row - 1 + 6) % 6) + 1, ((col - 1 + 6) % 6) + 1);
}

const toroidalBlocks = cells.map(id => {
  const { row, col } = parseCellId(id);
  return [
    cell(row, col), cell(row, col + 1), cell(row + 1, col), cell(row + 1, col + 1),
  ];
});

// A finite outside clue takes the run beginning at path[0]. Enumerate its
// possible lengths: every run cell has the start shade, followed by the other
// shade, and its digit sum is the printed total.
function firstRunSum(total, path) {
  return new Or(Array.from({ length: path.length - 1 }, (_, lengthIndex) => {
    const length = lengthIndex + 1;
    const run = path.slice(0, length);
    const after = path[length];
    return new And([
      new Sum(total, ...run),
      ...shade.at(run).map(value => new Given(value, SHADED)),
      new Given(shade.at(after), UNSHADED),
    ]);
  }).concat(Array.from({ length: path.length - 1 }, (_, lengthIndex) => {
    const length = lengthIndex + 1;
    const run = path.slice(0, length);
    const after = path[length];
    return new And([
      new Sum(total, ...run),
      ...shade.at(run).map(value => new Given(value, UNSHADED)),
      new Given(shade.at(after), SHADED),
    ]);
  })));
}

const clues = [
  [22, ['R1C6', 'R2C1', 'R3C2', 'R4C3', 'R5C4', 'R6C5']],
];

return [
  new Shape('6x6'),
  shade.toVar('shade'),
  shade.makeReplicate(new Given(firstShade, SHADED, UNSHADED)),
  ...toroidalBlocks.map(block =>
    new NFA(noMono2x2Machine, 'no-mono-toroidal-2x2', ...shade.at(block))),
  ...clues.map(([total, path]) => firstRunSum(total, path)),
];
