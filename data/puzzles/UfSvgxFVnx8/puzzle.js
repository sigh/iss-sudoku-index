// Title: River Crossing
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=UfSvgxFVnx8
// Source: https://sudokupad.app/x8uuju3q3e

// Normal Sudoku applies. The section-label overlay partitions the grid into
// three connected sections; all pairs touch, and no 2x2 is one section.
// Circled digits count circles in their section. On each teal line, every
// contiguous segment in a given section has the same sum, and the line crosses
// a section boundary.

const CIRCLES = [
  'R1C9', 'R2C2', 'R2C3', 'R3C2', 'R3C5', 'R6C1',
  'R7C5', 'R7C8', 'R8C7', 'R8C8', 'R9C4',
];

// Teal section-sum line paths transcribed from the drawn lines.
const LINES = [
  ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9'],
  ['R9C7', 'R9C8', 'R9C9', 'R8C9', 'R7C9'],
  ['R4C9', 'R3C9', 'R2C9', 'R2C8', 'R1C7', 'R1C6', 'R1C5', 'R2C4', 'R3C3', 'R4C2'],
  ['R1C2', 'R1C1', 'R2C1', 'R3C1'],
  ['R4C7', 'R3C7', 'R2C7', 'R2C6', 'R3C6', 'R4C5', 'R4C4'],
  ['R7C2', 'R7C3', 'R7C4', 'R6C4', 'R6C5', 'R6C6'],
  ['R8C1', 'R9C2', 'R8C3'],
];

const graph = cellGraph('9x9');
const sections = graph.makeOverlay('VSC');
const sectionCells = sections.at(graph.cells());
const sectionDomain = sections.makeReplicate(new Given(sections.at('R1C1'), 1, 2, 3));

const edges = graph.cells().flatMap(cell =>
  graph.neighbours(cell).filter(other => cell < other).map(other => [cell, other])
);
const touchingPairKey = (a, b) => Pair.fnToKey(
  (x, y) => (x === a && y === b) || (x === b && y === a), 9
);
const sectionTouching = [[1, 2], [1, 3], [2, 3]].map(([a, b]) =>
  new Or(edges.map(([x, y]) =>
    new Pair(touchingPairKey(a, b), `sections ${a} and ${b} touch`, sections.at(x), sections.at(y))
  ))
);

// This NFA rejects exactly the four-equal-label 2x2 pattern.
const notMonochrome2x2 = NFA.encodeSpec({
  startState: { first: null, same: true },
  transition: ({ first, same }, value) =>
    first === null ? { first: value, same: true } : { first, same: same && value === first },
  accept: ({ same }) => !same,
}, 9);
const blocks = [];
for (let row = 1; row <= 8; row++) {
  for (let col = 1; col <= 8; col++) {
    blocks.push([makeCellId(row, col), makeCellId(row, col + 1), makeCellId(row + 1, col), makeCellId(row + 1, col + 1)]);
  }
}
const sectionBlocks = sections.makeReplicate(
  new NFA(notMonochrome2x2, 'not one section', ...sections.at(blocks[0])),
  sections.at(blocks.map(cells => cells[0])),
);

// A circle's grid digit is followed by its section label and every circle label.
// The NFA counts labels equal to that section label and matches the digit.
const circleCountSpec = NFA.encodeSpec({
  startState: { target: null, label: null, count: 0 },
  transition: ({ target, label, count }, value) => {
    if (target === null) return { target: value, label: null, count: 0 };
    if (label === null) return { target, label: value, count: 0 };
    const next = count + (value === label ? 1 : 0);
    return next > target ? undefined : { target, label, count: next };
  },
  accept: ({ target, label, count }) => label !== null && count === target,
}, 9);
const circleCounts = CIRCLES.map(circle =>
  new NFA(circleCountSpec, 'circle count in section', circle, sections.at(circle), ...sections.at(CIRCLES))
);

// For one fixed section label, an Or selects the shared segment sum. Each small
// NFA scans interleaved label/digit pairs and checks every run of that label.
function equalSectionSegments(label) {
  return cells => new Or(Array.from({ length: cells.length * 9 }, (_, index) => {
    const target = index + 1;
    const spec = NFA.encodeSpec({
      startState: { pending: null, sum: 0 },
      transition: ({ pending, sum }, value) => {
        if (pending === null) return { pending: value === label, sum };
        if (pending) {
          const next = sum + value;
          return next > target ? undefined : { pending: null, sum: next };
        }
        return sum === 0 || sum === target ? { pending: null, sum: 0 } : undefined;
      },
      accept: ({ pending, sum }) => pending === null && (sum === 0 || sum === target),
      maxDepth: cells.length * 2,
    }, 9);
    return new NFA(spec, `section ${label} segments sum to ${target}`,
      ...cells.flatMap(cell => [sections.at(cell), cell]));
  }));
}
const sectionLineSums = LINES.flatMap(cells => [1, 2, 3].map(label => equalSectionSegments(label)(cells)));

// Each line has at least one adjacent pair of cells in different sections.
const differentLabels = Pair.fnToKey((a, b) => a !== b, 9);
const crossingLines = LINES.map(cells => new Or(cells.slice(1).map((cell, i) =>
  new AllDifferent(sections.at(cells[i]), sections.at(cell))
)));

return [
  new Shape('9x9'),
  sections.toVar('three section labels'),
  sectionDomain,
  new ConnectedValues('VSC', 1),
  new ConnectedValues('VSC', 2),
  new ConnectedValues('VSC', 3),
  ...sectionTouching,
  sectionBlocks,
  ...circleCounts,
  ...sectionLineSums,
  ...crossingLines,
];
