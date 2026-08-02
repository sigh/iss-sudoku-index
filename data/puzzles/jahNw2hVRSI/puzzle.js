// Title: Bubbles
// Author: alexc
// Video: https://www.youtube.com/watch?v=jahNw2hVRSI
// Source: https://app.crackingthecryptic.com/sudoku/N6GnjPHLR3

// Normal Sudoku. The VB overlay labels the nine unshaded bubbles (one label
// per drawn large circle) and the single shaded region. No 2x2 is all shaded.
// A bubble contains exactly digits 1 through the digit in its circle. White
// dots are consecutive, and at least one additional adjacent consecutive pair
// has no drawn dot.

const SHADED = 10;
const graph = cellGraph('9x9');
const gridCells = graph.cells();
const bubble = graph.makeOverlay('VB');
const circles = [
  'R1C6', 'R3C3', 'R3C7', 'R4C1', 'R4C9', 'R5C6', 'R7C8', 'R8C7', 'R9C8',
];
const dots = [
  ['R4C2', 'R5C2'], ['R7C2', 'R7C3'], ['R5C6', 'R6C6'], ['R6C9', 'R7C9'],
];

const firstGrid = gridCells[0];
const firstBubble = bubble.cells()[0];
const gridDomain = graph.makeReplicate(new Given(firstGrid, 1, 2, 3, 4, 5, 6, 7, 8, 9));
const bubbleDomain = bubble.makeReplicate(
  new Given(firstBubble, 1, 2, 3, 4, 5, 6, 7, 8, 9, SHADED));

// Adjacent unshaded cells share a label, so each labelled component has only
// its own circle. The label's ConnectedValues constraint makes it one region.
const sameUnshadedLabel = Pair.fnToKey(
  (a, b) => a === SHADED || b === SHADED || a === b, 10);
const horizontalOrigins = gridCells.filter(cell => graph.block(cell, 1, 2));
const verticalOrigins = gridCells.filter(cell => graph.block(cell, 2, 1));
const adjacencies = [
  ...horizontalOrigins.map(cell => graph.block(cell, 1, 2)),
  ...verticalOrigins.map(cell => graph.block(cell, 2, 1)),
];
const bubbleEdges = [
  bubble.makeReplicate(
    new Pair(sameUnshadedLabel, 'bubble-label', ...bubble.at(graph.block('R1C1', 1, 2))),
    bubble.at(horizontalOrigins)),
  bubble.makeReplicate(
    new Pair(sameUnshadedLabel, 'bubble-label', ...bubble.at(graph.block('R1C1', 2, 1))),
    bubble.at(verticalOrigins)),
];

// Read a circle digit, then each (bubble-label, grid-digit) pair. For this
// label and digit d, the count is one precisely when d is at most the circle
// digit, otherwise zero. The nine d-machines therefore give the label exactly
// the set 1..n, each once, where n is its circle's digit.
function bubbleDigitMachine(label, digit) {
  return NFA.encodeSpec({
    startState: { circle: null, pending: null, count: 0 },
    transition: ({ circle, pending, count }, value) => {
      if (circle === null) return { circle: value, pending: null, count: 0 };
      if (pending === null) return { circle, pending: value, count };
      const nextCount = count + (pending === label && value === digit ? 1 : 0);
      return nextCount > 1 ? undefined : { circle, pending: null, count: nextCount };
    },
    accept: ({ circle, pending, count }) =>
      circle !== null && pending === null && count === (circle >= digit ? 1 : 0),
  }, 10);
}
const bubbleContents = circles.flatMap((circle, index) =>
  Array.from({ length: 9 }, (_, offset) => {
    const digit = offset + 1;
    return new NFA(
      bubbleDigitMachine(index + 1, digit), `bubble-${index + 1}-digit-${digit}`,
      circle, ...gridCells.flatMap(cell => [bubble.at(cell), cell]),
    );
  }));

// No 2x2 square is entirely shaded; this machine reads a 2x2 VB block.
const noAllShadedMachine = NFA.encodeSpec({
  startState: { seen: 0 },
  transition: ({ seen }, value) => {
    const next = seen + (value === SHADED ? 1 : 0);
    return next === 4 ? undefined : { seen: next };
  },
  accept: () => true,
}, 10);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noAllShaded = bubble.makeReplicate(
  new NFA(noAllShadedMachine, 'no-all-shaded-2x2', ...bubble.at(graph.block('R1C1', 2, 2))),
  bubble.at(blockOrigins));

const dotKeys = new Set(dots.map(pair => [...pair].sort().join('|')));
const undottedConsecutive = adjacencies
  .filter(pair => !dotKeys.has([...pair].sort().join('|')))
  .map(pair => new WhiteDot(...pair));

return [
  new Shape('9x9', 10),
  bubble.toVar('bubble labels'),
  gridDomain,
  bubbleDomain,
  ...circles.map((cell, index) => new Given(bubble.at(cell), index + 1)),
  ...bubbleEdges,
  ...circles.map((_, index) => new ConnectedValues('VB', index + 1)),
  new ConnectedValues('VB', SHADED),
  noAllShaded,
  ...bubbleContents,
  ...dots.map(pair => new WhiteDot(...pair)),
  new Or(undottedConsecutive),
];
