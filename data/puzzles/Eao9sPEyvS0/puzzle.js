// Title: Milestones
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=Eao9sPEyvS0
// Source: https://sudokupad.app/d4qzz9umkk

// Encodes normal sudoku; grey/orange cell states; no monochrome 2x2 areas;
// milestone arrows; orange-only Dutch whispers; and the six balanced cages.
// The region-size clues and the rule forbidding diagonal contact between
// separate same-colour regions are omitted: they require identifying unknown
// connected components, rather than merely assigning a colour to each cell.

const GREY = 1;
const ORANGE = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const color = graph.makeOverlay('VC');
const gridCells = graph.cells();

const colorDomain = color.makeReplicate(
  new Given(color.cells()[0], GREY, ORANGE));

// The local no-2x2 rule is applied to every drawn-grid 2x2 block.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = color.makeReplicate(
  new NFA(noMono2x2Machine, 'no-monochrome-2x2',
    ...color.at(graph.block(gridCells[0], 2, 2))),
  color.at(blockOrigins));

// Arrow cells and their complete in-grid rays, transcribed from the white
// arrowheads on the grey circular markers. Each branch says that the first
// opposite colour occurs exactly digit cells away.
const milestones = [
  ['R8C1', ['R7C2', 'R6C3', 'R5C4', 'R4C5', 'R3C6', 'R2C7', 'R1C8']],
  ['R8C2', ['R7C2', 'R6C2', 'R5C2', 'R4C2', 'R3C2', 'R2C2', 'R1C2']],
  ['R7C2', ['R6C2', 'R5C2', 'R4C2', 'R3C2', 'R2C2', 'R1C2']],
  ['R6C2', ['R5C2', 'R4C2', 'R3C2', 'R2C2', 'R1C2']],
  ['R5C5', ['R4C5', 'R3C5', 'R2C5', 'R1C5']],
  ['R7C1', ['R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1', 'R1C1']],
  ['R6C1', ['R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8', 'R6C9']],
  ['R4C7', ['R4C8', 'R4C9']],
  ['R1C4', ['R2C4', 'R3C4', 'R4C4', 'R5C4', 'R6C4', 'R7C4', 'R8C4', 'R9C4']],
  ['R3C7', ['R4C7', 'R5C7', 'R6C7', 'R7C7', 'R8C7', 'R9C7']],
  ['R7C3', ['R8C3', 'R9C3']],
  ['R5C2', ['R6C2', 'R7C2', 'R8C2', 'R9C2']],
  ['R7C6', ['R8C6', 'R9C6']],
  ['R5C6', ['R4C5', 'R3C4', 'R2C3', 'R1C2']],
  ['R4C9', ['R3C8', 'R2C7', 'R1C6']],
  ['R6C7', ['R5C7', 'R4C7', 'R3C7', 'R2C7', 'R1C7']],
];

function milestoneConstraint(cell, ray) {
  return new Or(ray.map((target, index) => {
    const distance = index + 1;
    return new And([
      new Given(cell, distance),
      ...color.at([cell, ...ray.slice(0, index)])
        .map(shadeCell => new Given(shadeCell, GREY)),
      new Given(color.at(target), ORANGE),
    ]);
  }).concat(ray.map((target, index) => {
    const distance = index + 1;
    return new And([
      new Given(cell, distance),
      ...color.at([cell, ...ray.slice(0, index)])
        .map(shadeCell => new Given(shadeCell, ORANGE)),
      new Given(color.at(target), GREY),
    ]);
  })));
}
const milestoneRules = milestones.map(([cell, ray]) => milestoneConstraint(cell, ray));

// For each orthogonal pair, only an orange-orange pair is constrained to be a
// Dutch whisper; any pair containing grey is permitted.
const whisperKey = Pair.fnToKey((a, b) => Math.abs(a - b) >= 4, geometry);
const orthogonalPairs = gridCells.flatMap(a => [
  graph.step(a, 0, 1),
  graph.step(a, 1, 0),
].filter(b => b !== null).map(b => [a, b]));
const orangeWhispers = orthogonalPairs.map(([a, b]) => new Or([
  new And([new Given(color.at(a), GREY)]),
  new And([new Given(color.at(b), GREY)]),
  new And([new Pair(whisperKey, 'orange-whisper', a, b)]),
]));

// These are the six drawn no-total cage cell sets. Each colour assignment is
// enumerated, and the signed Sum makes grey digits equal orange digits.
const cages = [
  ['R3C2', 'R3C3', 'R4C2', 'R4C3'],
  ['R5C3', 'R6C3', 'R7C3', 'R8C3'],
  ['R4C6', 'R5C6', 'R5C7', 'R6C6', 'R6C7'],
  ['R7C1', 'R8C1', 'R8C2', 'R9C1'],
  ['R4C9', 'R5C8', 'R5C9', 'R6C8', 'R6C9'],
  ['R7C7', 'R7C8', 'R8C6', 'R8C7'],
];

function balancedCage(cells) {
  const assignments = Array.from({ length: (1 << cells.length) - 2 }, (_, index) => index + 1);
  return new Or(assignments.map(mask => {
    const isGrey = index => (mask & (1 << index)) !== 0;
    const greyCells = cells.filter((cell, index) => isGrey(index));
    const orangeCells = cells.filter((cell, index) => !isGrey(index));
    return new And([
      ...cells.map((cell, index) => new Given(color.at(cell),
        isGrey(index) ? GREY : ORANGE)),
      new EqualSum(greyCells, orangeCells),
    ]);
  }));
}
const balancedCages = cages.map(balancedCage);

return [
  new Shape('9x9'),
  color.toVar('grey and orange states'),
  colorDomain,
  noMono2x2,
  ...milestoneRules,
  ...orangeWhispers,
  ...balancedCages,
];
