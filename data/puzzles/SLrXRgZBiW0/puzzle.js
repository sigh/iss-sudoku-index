// Title: Misconduct
// Author: JamNCheez
// Video: https://www.youtube.com/watch?v=SLrXRgZBiW0
// Source: https://sudokupad.app/jtDRPfPMQ9

// Normal Sudoku applies. Each light-grey line has the same digit product (with
// repeats allowed within a line); the NFA's first, three-cell segment supplies
// the shared product, and every later segment must reproduce it. V/X markers
// sum to 5/10 respectively. There is no negative XV rule.
// Light-grey paths transcribed from the source drawing; the three-cell path is
// the shared reference for the pairwise product comparisons below.
const productLines = [
  ['R5C4', 'R5C3', 'R5C2'],
  ['R9C8', 'R9C9', 'R8C9', 'R7C9'],
  ['R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7'],
  ['R7C1', 'R8C2', 'R9C2', 'R9C3', 'R9C4'],
  ['R4C5', 'R4C6', 'R5C6', 'R6C5'],
  ['R3C5', 'R3C6', 'R2C6', 'R1C6'],
  ['R1C7', 'R2C7', 'R3C7', 'R4C8'],
  ['R3C8', 'R3C9', 'R2C9', 'R1C8'],
  ['R4C7', 'R5C7', 'R6C8', 'R6C9'],
  ['R1C2', 'R1C3', 'R2C3', 'R3C3'],
  ['R4C1', 'R4C2', 'R4C3', 'R3C4'],
];

const referenceLine = productLines[0];

const productsOfLength = (length) => {
  let products = new Set([1]);
  for (let i = 0; i < length; i++) {
    const next = new Set();
    for (const product of products) {
      for (let digit = 1; digit <= 9; digit++) next.add(product * digit);
    }
    products = next;
  }
  return products;
};
const suffixProducts = Array.from({ length: 6 }, (_, length) =>
  productsOfLength(length));

// Each machine scans the reference and one other line. Its state records the
// reference product, then a divisor product on the compared path; `phase` and
// `position` make segment boundaries and lengths part of the automaton.
const sameProductAsReference = (line) => NFA.encodeSpec({
  startState: { phase: 0, position: 0, product: 1, target: null },
  transition: ({ phase, position, product, target }, value) => {
    if (value === SEGMENT_BREAK) {
      if (phase !== 0 || position !== referenceLine.length) return undefined;
      return { phase: 1, position: 0, product: 1, target: product };
    }
    const length = phase === 0 ? referenceLine.length : line.length;
    if (position === length) return undefined;
    const next = product * value;
    if (phase === 1) {
      const remaining = length - position - 1;
      if (target % next !== 0 || !suffixProducts[remaining].has(target / next)) {
        return undefined;
      }
    }
    return { phase, position: position + 1, product: next, target };
  },
  accept: ({ phase, position, product, target }) =>
    phase === 1 && position === line.length && product === target,
  maxDepth: referenceLine.length + line.length + 1,
}, 9, { multiSegment: true });

const productComparisons = productLines.slice(1).map((line, index) =>
  new NFA(sameProductAsReference(line), `common-product-${index + 1}`,
    referenceLine, line));

return [
  new Shape('9x9'),
  ...productComparisons,
  new V('R6C4', 'R6C5'),
  new V('R8C4', 'R9C4'),
  new V('R1C5', 'R1C6'),
  new X('R9C7', 'R9C8'),
  new X('R4C3', 'R5C3'),
];
