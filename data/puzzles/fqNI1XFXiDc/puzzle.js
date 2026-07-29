// Title: The X Factors
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=fqNI1XFXiDc
// Source: https://app.crackingthecryptic.com/zs5rccbja5

// Fill the playable grid with 1-6 once per row, column, and drawn region.
//
// Each orange clue equals the product of the first X digits on its arrow ray,
// where X is the first ray digit. Its question marks are decimal digits 0-9.
// Every represented question-mark digit occurs exactly that many times among
// all question marks. Every clue must be determined; no rule is omitted.

const shape = new Shape('6x6', '0-9');
const graph = cellGraph('6x6');

// The six black-outlined regions, normalized after dropping the canvas frame.
const regions = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C2', 'R2C3', 'R3C2'],
  ['R1C4', 'R1C5', 'R1C6', 'R2C4', 'R2C5', 'R3C4'],
  ['R2C1', 'R3C1', 'R4C1', 'R4C2', 'R5C1', 'R6C1'],
  ['R2C6', 'R3C5', 'R3C6', 'R4C6', 'R5C6', 'R6C6'],
  ['R3C3', 'R4C3', 'R5C2', 'R5C3', 'R6C2', 'R6C3'],
  ['R4C4', 'R4C5', 'R5C4', 'R5C5', 'R6C4', 'R6C5'],
];

// VQ1..VQ16 are the question marks in clue-list order, and left-to-right
// within each multi-digit orange clue.
const questionMarks = cellGraph('1x16').makeOverlay('VQ');
const q = questionMarks.cells();

// Drawn clue widths and arrow rays. The outer 8x8 canvas frame has been removed
// from the ray coordinates.
const clues = [
  { digits: [q[0]], ray: ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6'] },
  { digits: q.slice(1, 4), ray: ['R1C3', 'R2C4', 'R3C5', 'R4C6'] },
  { digits: [q[4]], ray: ['R3C1', 'R4C2', 'R5C3', 'R6C4'] },
  { digits: [q[5]], ray: graph.row(3) },
  { digits: q.slice(6, 8), ray: ['R3C1', 'R2C2', 'R1C3'] },
  { digits: q.slice(8, 10), ray: ['R6C4', 'R5C3', 'R4C2', 'R3C1'] },
  { digits: q.slice(10, 12), ray: ['R4C6', 'R3C5', 'R2C4', 'R1C3'] },
  { digits: q.slice(12, 14), ray: ['R4C6', 'R5C5', 'R6C4'] },
  { digits: q.slice(14, 16), ray: ['R3C6', 'R4C5', 'R5C4', 'R6C3'] },
];

const possibleProducts = rayLength => {
  const products = new Set();
  const extend = (left, product) => {
    if (left === 0) {
      products.add(product);
      return;
    }
    for (let digit = 1; digit <= 6; digit++) extend(left - 1, product * digit);
  };
  for (let x = 1; x <= Math.min(6, rayLength); x++) extend(x - 1, x);
  return products;
};

// The machine reads all decimal clue digits first, followed by the ray. Once X
// has been read, `left` is how many further ray digits must be multiplied.
const xProductMachine = (clueLength, rayLength) => {
  const targets = possibleProducts(rayLength);
  const depth = clueLength + rayLength;
  return NFA.encodeSpec({
    startState: { phase: 'clue', i: 0, target: 0 },
    transition: (state, value) => {
      if (state.phase === 'clue') {
        const target = 10 * state.target + value;
        const i = state.i + 1;
        if (i < clueLength) return { phase: 'clue', i, target };
        return targets.has(target)
          ? { phase: 'ray-start', target } : undefined;
      }
      if (state.phase === 'ray-start') {
        if (value < 1 || value > rayLength) return undefined;
        if (value === 1) {
          return value === state.target ? { phase: 'done' } : undefined;
        }
        return {
          phase: 'product',
          target: state.target,
          product: value,
          left: value - 1,
        };
      }
      if (state.phase === 'product') {
        const product = state.product * value;
        if (product > state.target) return undefined;
        return state.left === 1
          ? (product === state.target ? { phase: 'done' } : undefined)
          : { phase: 'product', target: state.target, product, left: state.left - 1 };
      }
      if (state.phase === 'done') return state;
      return undefined;
    },
    accept: state => state.phase === 'done',
    maxDepth: depth,
  }, shape);
};

const xProducts = clues.map(({ digits, ray }) =>
  new NFA(
    xProductMachine(digits.length, ray.length),
    'X product',
    ...digits,
    ...ray,
  ));

return [
  shape,
  new NoBoxes(),
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6)),
  ...regions.map(cells => new AllDifferent(...cells)),
  questionMarks.toVar('question-mark digits'),
  new CountingCircles(...q),
  ...xProducts,
];
