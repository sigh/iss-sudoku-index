// Title: Alto
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=ZPPu390EaC0
// Source: https://sudokupad.app/eb90s76a4e

// Rules encoded: 6x6 Sudoku, two-colour shading with no monochrome toroidal
// 2x2, and all six outside diagonal clues. The required toroidal same-colour
// connectivity is deliberately omitted: ConnectedValues only follows ordinary
// non-wrapping grid adjacency, so it cannot express connectivity that crosses
// the wraparound edges this puzzle allows.
//
// Each outside clue's raw waypoints sit inside the frame cell that carries its
// badge, offset toward one corner of that cell (e.g. the 22 clue's waypoints
// are at row 0.745-0.922, col 5.745-5.922 of an 8-wide canvas: both close to
// the row1/col6 boundary). The arrow's own drawn direction (down-right etc.)
// then names a single one of the four cells touching that corner as the run's
// first cell -- the one lying in that direction from the corner. The rules
// text's worked example confirms this reading for the 22 clue (its second
// cell, after wrapping, is stated to be R2C1), and every other clue is read
// the same way from its own raw waypoints.

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

// A run that never meets the opposite shade (the infinity clue) means every
// cell on that diagonal shares one shade: two branches, all-shaded or
// all-unshaded.
function infiniteRun(path) {
  return new Or([SHADED, UNSHADED].map(value =>
    new And(shade.at(path).map(v => new Given(v, value)))));
}

const clues = [
  // Badge cell R1C6, arrow down-right (raw waypoints row 0.745-0.922,
  // col 5.745-5.922): enters at R1C6; confirmed by the rules text's own
  // worked example (2nd cell R2C1).
  [22, ['R1C6', 'R2C1', 'R3C2', 'R4C3', 'R5C4', 'R6C5']],
  // Badge cell R1C3, arrow down-right (row 0.745-0.922, col 2.745-2.922):
  // enters at R1C3.
  [24, ['R1C3', 'R2C4', 'R3C5', 'R4C6', 'R5C1', 'R6C2']],
  // Badge cell R8C7, arrow up-left (row 7.078-7.255, col 6.078-6.255):
  // enters at R6C5 -- the same toroidal diagonal as the 22 clue, read from
  // the opposite end and direction.
  [5, ['R6C5', 'R5C4', 'R4C3', 'R3C2', 'R2C1', 'R1C6']],
  // Badge cell R8C2, arrow up-right (row 7.078-7.255, col 1.745-1.922):
  // enters at R6C2.
  [5, ['R6C2', 'R5C3', 'R4C4', 'R3C5', 'R2C6', 'R1C1']],
  // Badge cell R6C1, arrow up-right (row 5.078-5.255, col 0.745-0.922):
  // enters at R4C1.
  [10, ['R4C1', 'R3C2', 'R2C3', 'R1C4', 'R6C5', 'R5C6']],
];

// Badge cell R1C5, arrow down-right (row 0.745-0.922, col 4.745-4.922):
// enters at R1C5.
const infinitePath = ['R1C5', 'R2C6', 'R3C1', 'R4C2', 'R5C3', 'R6C4'];

return [
  new Shape('6x6'),
  shade.toVar('shade'),
  shade.makeReplicate(new Given(firstShade, SHADED, UNSHADED)),
  ...toroidalBlocks.map(block =>
    new NFA(noMono2x2Machine, 'no-mono-toroidal-2x2', ...shade.at(block))),
  ...clues.map(([total, path]) => firstRunSum(total, path)),
  infiniteRun(infinitePath),
];
