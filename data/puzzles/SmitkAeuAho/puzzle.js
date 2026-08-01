// Title: One of these things ...
// Author: Jrosas
// Video: https://www.youtube.com/watch?v=SmitkAeuAho
// Source: https://app.crackingthecryptic.com/TRFJDDjmjt

// Normal Sudoku applies. Cells have one of two connected region labels; no 2x2
// is monochromatic. Each cage has one opposite-label cell, and its total is the
// sum of the remaining same-label cells. Cage digits are distinct. Dots are as drawn.

const SHADE_A = 1;
const SHADE_B = 2;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

const cages = [
  [16, ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R3C1']],
  [3, ['R3C4', 'R4C3', 'R4C4']],
  [6, ['R4C5', 'R5C4', 'R5C5']],
  [4, ['R5C6', 'R6C5', 'R6C6']],
  [13, ['R2C3', 'R3C2', 'R3C3']],
  [15, ['R4C2', 'R5C1', 'R5C2', 'R5C3', 'R6C2']],
  [9, ['R6C3', 'R6C4', 'R7C4']],
  [5, ['R2C7', 'R3C7', 'R3C8']],
  [5, ['R3C6', 'R4C6', 'R4C7']],
  [9, ['R8C9', 'R9C8', 'R9C9']],
  [5, ['R7C8', 'R8C7', 'R8C8']],
  [4, ['R6C7', 'R7C6', 'R7C7']],
  [16, ['R7C5', 'R8C4', 'R8C5']],
  [5, ['R8C6', 'R9C5', 'R9C6']],
  [30, ['R4C8', 'R5C7', 'R5C8', 'R5C9', 'R6C8']],
  [29, ['R1C7', 'R1C8', 'R1C9', 'R2C8', 'R2C9', 'R3C9']],
  [12, ['R1C4', 'R1C5', 'R1C6']],
  [5, ['R7C2', 'R7C3', 'R8C3']],
  [30, ['R7C1', 'R8C1', 'R8C2', 'R9C1', 'R9C2', 'R9C3']],
  [21, ['R2C4', 'R2C5', 'R2C6', 'R3C5']],
];

// The table is transcribed from the drawn dashed cages; each Or chooses the
// cage's sole opposite-region cell, then sums every other cell.
const cageRules = cages.map(([total, cells]) => new Or(cells.map((odd, i) => {
  const others = cells.filter((_, j) => j !== i);
  const otherShades = shade.at(others);
  return new And([
    new SameValues(otherShades.length, ...otherShades),
    new AllDifferent(shade.at(odd), otherShades[0]),
    new Sum(total, ...others),
  ]);
})));
const cageDistinct = cages.map(([, cells]) => new AllDifferent(...cells));

const blackDots = [['R1C7', 'R1C8']];
const whiteDots = [
  ['R2C2', 'R2C3'], ['R6C1', 'R7C1'], ['R6C5', 'R7C5'], ['R8C7', 'R9C7'],
];

// The NFA rejects only the two monochromatic 2x2 label patterns.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

return [
  new Shape('9x9'),
  shade.toVar('region'),
  shade.makeReplicate(new Given(shade.cells()[0], SHADE_A, SHADE_B)),
  // Region names are interchangeable, so choose a canonical name at R1C1.
  new Given(shade.at('R1C1'), SHADE_A),
  new ConnectedValues('VS', SHADE_A),
  new ConnectedValues('VS', SHADE_B),
  noMono2x2,
  ...cageRules,
  ...cageDistinct,
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
];
