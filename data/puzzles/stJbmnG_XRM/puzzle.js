// Title: Yin Yang Renban
// Author: Dag H
// Video: https://www.youtube.com/watch?v=stJbmnG_XRM
// Source: https://app.crackingthecryptic.com/sudoku/gj49HRdbGh

// Full encoding. Every cell is shaded or unshaded (Yin-Yang); each colour
// forms one orthogonally-connected region (ConnectedValues per shade) and no
// 2x2 block is monochrome. Every circled cell is shaded, and its own digit
// equals the count of shaded cells seen from it (itself plus an
// uninterrupted run in each of the four directions, stopped by the first
// unshaded cell or the grid edge). Pink lines are Renban (consecutive,
// non-repeating digits, any order).

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');

// Every shade Var is either shaded or unshaded.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, SHADED, UNSHADED));

// Circled cells, read from the `overlays` array (all circle, blank text).
const circles = [
  'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6',
  'R3C7', 'R3C8', 'R6C2', 'R6C6', 'R7C5',
];

// Every circled cell is shaded.
const circleGivens = circles.map(cell => new Given(shade.at(cell), SHADED));

// No 2x2 block may be all shaded or all unshaded: one NFA on the top-left
// block, replicated to every block origin.
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
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

// Directional run-length overlays, one Var per circle per direction. A run's
// value is (run length + 1), so it fits the grid's 1-9 domain (max possible
// run on a 9-wide line is 8).
const runUp = graph.makeOverlay('VU', circles);
const runDown = graph.makeOverlay('VD', circles);
const runLeft = graph.makeOverlay('VL', circles);
const runRight = graph.makeOverlay('VR', circles);

// runCell = k + 1 means: the next k cells outward (nearest first) are
// shaded, and the (k+1)-th cell -- if still on the grid -- is unshaded
// (the interrupting boundary). k ranges over every length the run could
// have, from 0 (immediately blocked) to the full ray length (runs off the
// grid edge).
function runLengthConstraint(runCell, dirCells) {
  const options = [];
  for (let k = 0; k <= dirCells.length; k++) {
    options.push(new And([
      new Given(runCell, k + 1),
      ...shade.at(dirCells.slice(0, k)).map(c => new Given(c, SHADED)),
      ...(k < dirCells.length
        ? [new Given(shade.at(dirCells[k]), UNSHADED)] : []),
    ]));
  }
  return new Or(options);
}

const runConstraints = circles.flatMap(cell => [
  runLengthConstraint(runUp.at(cell), graph.ray(cell, -1, 0).slice(1)),
  runLengthConstraint(runDown.at(cell), graph.ray(cell, 1, 0).slice(1)),
  runLengthConstraint(runLeft.at(cell), graph.ray(cell, 0, -1).slice(1)),
  runLengthConstraint(runRight.at(cell), graph.ray(cell, 0, 1).slice(1)),
]);

// The circled cell's digit = 1 (itself) + the four run lengths, and each run
// length is (runVar - 1), so digit - runUp - runDown - runLeft - runRight
// = 1 - 4 = -3.
const sightCounts = circles.map(cell => new Sum(
  -3, cell,
  [runUp.at(cell), -1], [runDown.at(cell), -1],
  [runLeft.at(cell), -1], [runRight.at(cell), -1]));

// Pink Renban lines, read from the drawn line paths. One drawn line has no
// resolvable path at all and is not a real clue; omitted.
const renbanLines = [
  ['R2C2', 'R3C2', 'R4C2'],
  ['R1C4', 'R1C5'],
  ['R1C1', 'R2C1', 'R3C1'],
  ['R2C7', 'R3C7'],
  ['R3C8', 'R4C8', 'R4C7', 'R4C6', 'R4C5', 'R4C4', 'R5C4'],
  ['R3C5', 'R3C4', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C3'],
  ['R8C1', 'R7C2', 'R8C2'],
  ['R9C4', 'R9C5'],
  ['R7C7', 'R8C8'],
  ['R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7'],
  ['R6C7', 'R6C8'],
  ['R6C6', 'R6C5', 'R7C5', 'R8C5'],
];
const renbans = renbanLines.map(cells => new Renban(...cells));

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  runUp.toVar('run-up'),
  runDown.toVar('run-down'),
  runLeft.toVar('run-left'),
  runRight.toVar('run-right'),
  shadeDomain,
  // Yin-Yang connectivity: each shade forms one orthogonally connected
  // region.
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  ...circleGivens,
  noMono2x2,
  ...runConstraints,
  ...sightCounts,
  ...renbans,
];
