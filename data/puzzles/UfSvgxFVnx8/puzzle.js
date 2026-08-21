// Title: River Crossing
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=UfSvgxFVnx8
// Source: https://sudokupad.app/x8uuju3q3e

// Rules encoded here:
//   1. Normal sudoku.
//   2. The grid is divided into 3 orthogonally connected sections; every pair
//      of sections shares an edge; no 2x2 square lies in a single section.
//   3. A digit in a circle counts the circles in its own section.
//   4. On each teal section-sum line, all adjacent groups of digits that lie in
//      one section have the same sum, and no line lies entirely in one section.
// Nothing is omitted. The section labels 1/2/3 are an artifact of this
// encoding, not of the puzzle, so they are fixed to a canonical order below.

// Circled cells, transcribed from the drawn white circles.
const CIRCLES = [
  'R1C9', 'R2C2', 'R2C3', 'R3C2', 'R3C5', 'R6C1',
  'R7C5', 'R7C8', 'R8C7', 'R8C8', 'R9C4',
];

// Teal line paths, transcribed from the drawn lines in drawing order.
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

// One section label per grid cell, drawn from {1, 2, 3}.
const sectionDomain = sections.makeReplicate(
  new Given(sections.at('R1C1'), 1, 2, 3));

// Section labels are interchangeable: the rules never distinguish them. This
// NFA keeps only the canonical labelling of each partition -- scanning the grid
// in reading order, a label may exceed every label seen so far by at most one,
// so the first cell is 1, the first cell outside its section is 2, and the
// first cell outside both is 3.
const canonicalLabels = new NFA(NFA.encodeSpec({
  startState: { seen: 0 },
  transition: ({ seen }, value) =>
    value > seen + 1 ? undefined : { seen: Math.max(seen, value) },
  accept: () => true,
}, 9), 'canonical section labels', ...sections.at(graph.cells()));

// "Each pair of sections shares an edge": for each pair of labels, some
// orthogonally adjacent cell pair carries exactly those two labels.
const edges = graph.cells().flatMap(cell =>
  graph.neighbours(cell).filter(other => cell < other).map(other => [cell, other]));
const sectionsTouch = [[1, 2], [1, 3], [2, 3]].map(([a, b]) => {
  const key = Pair.fnToKey(
    (x, y) => (x === a && y === b) || (x === b && y === a), 9);
  return new Or(edges.map(([x, y]) =>
    new Pair(key, `sections ${a} and ${b} touch`,
      sections.at(x), sections.at(y))));
});

// "No 2x2 square belongs to a single section": this machine reads the four
// labels of one 2x2 block and accepts only when they are not all equal.
const notOneSection = NFA.encodeSpec({
  startState: { first: null, same: true },
  transition: ({ first, same }, value) =>
    first === null
      ? { first: value, same: true }
      : { first, same: same && value === first },
  accept: ({ same }) => !same,
}, 9);
const blockOrigins = graph.cells().filter(
  cell => graph.block(cell, 2, 2) !== null);
const noMonochromeBlock = sections.makeReplicate(
  new NFA(notOneSection, 'not one section',
    ...sections.at(graph.block(blockOrigins[0], 2, 2))),
  sections.at(blockOrigins));

// "A digit in a circle indicates the number of circles in its section": the
// machine reads the circle's digit as its target, then the circle's own section
// label, then the labels of all eleven circles, and counts the matches.
const circleCountSpec = NFA.encodeSpec({
  startState: { target: null, label: null, count: 0 },
  transition: ({ target, label, count }, value) => {
    if (target === null) return { target: value, label: null, count: 0 };
    if (label === null) return { target, label: value, count: 0 };
    const next = count + (value === label ? 1 : 0);
    // Counting past the target can only fail, so that branch is dropped.
    return next > target ? undefined : { target, label, count: next };
  },
  accept: ({ target, label, count }) => label !== null && count === target,
}, 9);
const circleCounts = CIRCLES.map(circle =>
  new NFA(circleCountSpec, 'circles in this section',
    circle, sections.at(circle), ...sections.at(CIRCLES)));

// Section-sum line, for one candidate common total. The machine reads the line
// as alternating [section label, digit] pairs: it accumulates a group's digits,
// and at each change of label it demands the finished group total the target.
function lineGroupsSumTo(cells, target) {
  const spec = NFA.encodeSpec({
    startState: { label: null, sum: 0, digitNext: false },
    transition: ({ label, sum, digitNext }, value) => {
      if (!digitNext) {
        // A label equal to the previous cell's continues the current group;
        // a different one closes it, which requires the target to be met.
        if (label !== null && value !== label && sum !== target) return undefined;
        const carry = label === null || value === label ? sum : 0;
        return { label: value, sum: carry, digitNext: true };
      }
      const next = sum + value;
      return next > target ? undefined : { label, sum: next, digitNext: false };
    },
    accept: ({ label, sum, digitNext }) =>
      !digitNext && label !== null && sum === target,
  }, 9);
  return new NFA(spec, `line groups sum to ${target}`,
    ...cells.flatMap(cell => [sections.at(cell), cell]));
}

// The line is split into at least two groups (next constraint), so its smallest
// group holds at most floor(length / 2) cells and the shared total is at most
// nine times that. Every total in range gets a branch.
const sectionSumLines = LINES.map(cells => new Or(
  Array.from({ length: 9 * Math.floor(cells.length / 2) },
    (_, index) => lineGroupsSumTo(cells, index + 1))));

// "No line can be entirely in one section": some adjacent pair on the line
// straddles a section boundary.
const linesCrossSections = LINES.map(cells => new Or(
  cells.slice(1).map((cell, index) =>
    new AllDifferent(sections.at(cells[index]), sections.at(cell)))));

return [
  new Shape('9x9'),
  sections.toVar('section labels'),
  sectionDomain,
  canonicalLabels,
  new ConnectedValues('VSC', 1),
  new ConnectedValues('VSC', 2),
  new ConnectedValues('VSC', 3),
  ...sectionsTouch,
  noMonochromeBlock,
  ...circleCounts,
  ...sectionSumLines,
  ...linesCrossSections,
];
