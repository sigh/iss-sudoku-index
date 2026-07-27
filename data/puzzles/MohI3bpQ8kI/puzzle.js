// Title: Double Scaled Harmony
// Author: gdc
// Video: https://www.youtube.com/watch?v=MohI3bpQ8kI
// Source: https://sudokupad.app/qn9k75pdfy

// Full encoding. Normal Sudoku (default row/col/box) plus:
// - Yin Yang: shade cells so shaded and unshaded each form one orthogonally
//   connected region, and every 2x2 area has both shades.
// - Values: an unshaded cell's value is its digit; a shaded cell's value is
//   double its digit.
// - Arrows: the values (not digits) along the arm sum to the circle cell's
//   own value.
// The drawn "foglight" cage and the fog reveal mechanic are solving UI, not
// final-grid rules, and are not encoded.

const SHADED = 1;
const UNSHADED = 2;
const MAX_VALUE = 18; // largest possible cell value: digit 9, shaded.

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');

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
}, graph.gridGeometry().numValues);
const blockOrigins = graph.cells().filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(graph.cells()[0], 2, 2))),
  shade.at(blockOrigins));

// Arrow cell paths: recovered from the drawn arrow polylines, with the bulb
// identified as the path cell matching the drawn circle mark. `arm` runs
// bulb-to-arrowhead, excluding the bulb.
const arrows = [
  { bulb: 'R1C9', arm: ['R2C9', 'R3C9', 'R2C8', 'R1C7', 'R1C8'] },
  { bulb: 'R2C7', arm: ['R3C7', 'R3C8', 'R4C9', 'R5C9'] },
  { bulb: 'R1C6', arm: ['R2C6', 'R3C5', 'R3C6', 'R4C5'] },
  { bulb: 'R2C3', arm: ['R2C4', 'R2C5'] },
  { bulb: 'R4C3', arm: ['R4C2'] },
  { bulb: 'R5C2', arm: ['R4C1', 'R3C1', 'R2C2', 'R1C1'] },
  { bulb: 'R6C2', arm: ['R7C2'] },
  { bulb: 'R6C3', arm: ['R7C3', 'R7C4'] },
  { bulb: 'R6C6', arm: ['R5C5', 'R4C6', 'R4C7'] },
  { bulb: 'R8C6', arm: ['R7C7', 'R6C8'] },
  { bulb: 'R7C5', arm: ['R6C4', 'R5C4'] },
];

// One NFA per arrow, scanning (digit, shade-flag) pairs for each arm cell in
// order, then the bulb's own (digit, shade-flag) pair last. `sum` accumulates
// arm values as they are read; it is capped dead (`undefined`) the moment it
// exceeds MAX_VALUE, since no bulb value could still match. On the final
// (bulb) pair the state computes the bulb's own value from its digit/flag
// and requires it to equal the accumulated arm sum, rather than folding the
// bulb into the running total -- this keeps `sum` bounded to 0..MAX_VALUE
// instead of growing unbounded state on the subtraction.
function arrowValueMachine(pairCount) {
  return NFA.encodeSpec({
    startState: { pairIndex: 0, sum: 0, pendingDigit: null },
    transition: ({ pairIndex, sum, pendingDigit }, value) => {
      if (pendingDigit === null) {
        // `value` is the digit half of this pair.
        return { pairIndex, sum, pendingDigit: value };
      }
      // `value` is the shade-flag half of this pair; combine with the
      // digit read just before it into that cell's value.
      const cellValue = pendingDigit * (value === SHADED ? 2 : 1);
      const isBulbPair = pairIndex === pairCount - 1;
      if (isBulbPair) {
        if (cellValue !== sum) return undefined;
        return { pairIndex: pairIndex + 1, sum: 0, pendingDigit: null };
      }
      const nextSum = sum + cellValue;
      if (nextSum > MAX_VALUE) return undefined;
      return { pairIndex: pairIndex + 1, sum: nextSum, pendingDigit: null };
    },
    accept: ({ pairIndex, pendingDigit }) =>
      pendingDigit === null && pairIndex === pairCount,
  }, graph.gridGeometry().numValues);
}

const arrowConstraints = arrows.map(({ bulb, arm }) => {
  const pairCount = arm.length + 1;
  const cells = [...arm, bulb].flatMap(cell => [cell, shade.at(cell)]);
  return new NFA(
    arrowValueMachine(pairCount), `arrow-value-${bulb}`, ...cells);
});

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  new Given('R4C8', 9),
  shadeDomain,
  // Yin-Yang connectivity: each shade forms one orthogonally connected
  // region.
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...arrowConstraints,
];
