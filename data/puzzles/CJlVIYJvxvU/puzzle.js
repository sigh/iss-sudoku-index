// Title: Baby Dragon
// Author: zetamath
// Video: https://www.youtube.com/watch?v=CJlVIYJvxvU
// Source: https://app.crackingthecryptic.com/sudoku/JHPNrLgRQH

// Normal Sudoku, a two-colour Yin-Yang grid, and the grey ring's contiguous
// same-colour sum-10 groups are encoded below.  The colour names have no
// stated identity, so R1C1 fixes the otherwise free global colour swap.

const SHADED = 1;
const UNSHADED = 2;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('YY');

// Drawn grey ring, in its walk order; the repeated closing R3C1 is omitted.
const ring = [
  'R3C1', 'R2C1', 'R1C1', 'R2C2', 'R3C2', 'R2C3', 'R1C4', 'R2C4',
  'R2C5', 'R3C5', 'R3C6', 'R4C6', 'R5C6', 'R6C7', 'R5C8', 'R4C8',
  'R3C8', 'R2C7', 'R2C8', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9',
  'R8C9', 'R9C8', 'R9C7', 'R8C8', 'R7C7', 'R8C6', 'R8C5', 'R8C4',
  'R7C5', 'R7C4', 'R8C3', 'R7C3', 'R6C4', 'R6C3', 'R7C2', 'R6C1',
  'R5C2', 'R4C3', 'R4C2',
];

// The NFA scans alternating ring-colour and ring-digit cells.  Its initial
// carry branches over where the arbitrary scan cut falls inside a sum-10
// group; a completed group demands the opposite colour for the next group.
function ringGroupsMachine(initialCarry) {
  return NFA.encodeSpec({
  startState: {
    initialShade: null,
    groupShade: null,
    sum: initialCarry,
    expect: 'shade',
  },
  transition: (state, value) => {
    const { initialShade, groupShade, sum, expect } = state;
    if (expect === 'shade') {
      if (groupShade === null) {
        return { ...state, initialShade: value, groupShade: value, expect: 'digit' };
      }
      if (sum === 0) {
        return value === groupShade
          ? undefined
          : { ...state, groupShade: value, expect: 'digit' };
      }
      return value === groupShade ? { ...state, expect: 'digit' } : undefined;
    }
    const nextSum = sum + value;
    if (nextSum > 10) return undefined;
    return { ...state, sum: nextSum === 10 ? 0 : nextSum, expect: 'shade' };
  },
  accept: ({ initialShade, groupShade, sum, expect }) => (
    expect === 'shade' && (
      (initialCarry === 0 && sum === 0 && initialShade !== groupShade) ||
      (initialCarry > 0 && sum === initialCarry && initialShade === groupShade)
    )
  ),
  maxDepth: ring.length * 2,
}, geometry.numValues);
}
const ringSequence = ring.flatMap(cell => [shade.at(cell), cell]);
// One machine per carry avoids combining the 10 possible circular-cut states
// into a single NFA past ISS's 4096 compiled-state limit.
const ringGroups = new Or(Array.from({ length: 10 }, (_, initialCarry) =>
  new NFA(ringGroupsMachine(initialCarry), `ring-sum-10-colour-groups-${initialCarry}`,
    ...ringSequence)));

return [
  new Shape('9x9'),
  new YinYang(),
  new Given('R5C5', 9),
  new Given(shade.at('R1C1'), SHADED),
  ringGroups,
];
