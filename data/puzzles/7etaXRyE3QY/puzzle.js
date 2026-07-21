// Title: Fogtorization
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=7etaXRyE3QY
// Source: https://sudokupad.app/l310pkxn5d

// All blue cages sum to the two-digit number in R2C8-R2C9. Cage digits may repeat.
const sumCages = [
  ['R1C2', 'R1C3', 'R2C3', 'R3C3'],
  ['R1C4', 'R2C4'],
  ['R3C5', 'R4C4', 'R4C5', 'R5C3', 'R5C4', 'R5C5'],
  ['R3C8', 'R3C9', 'R4C8'],
  ['R4C2', 'R5C1', 'R5C2'],
  ['R7C2', 'R7C3', 'R8C2', 'R8C3'],
  ['R7C7', 'R7C8', 'R7C9', 'R8C9'],
  ['R8C7', 'R8C8'],
  ['R9C3', 'R9C4', 'R9C5'],
];

// All yellow cages multiply to the two-digit number in R1C8-R1C9.
const productCages = [
  ['R1C1', 'R2C1', 'R3C1'],
  ['R2C2', 'R3C2'],
  ['R1C5', 'R1C6', 'R2C6', 'R2C7'],
  ['R5C6', 'R6C6', 'R6C7', 'R6C8', 'R7C6'],
  ['R5C8', 'R5C9'],
  ['R8C1', 'R9C1', 'R9C2'],
  ['R9C7', 'R9C8', 'R9C9'],
];

const productSpec = NFA.encodeSpec({
  startState: {phase: 'cage', product: 1},
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      return {phase: 'tens', product: state.product};
    }
    if (state.phase === 'cage') {
      const product = state.product * value;
      // The displayed target has only two digits.
      return product <= 99 ? {phase: 'cage', product} : undefined;
    }
    if (state.phase === 'tens') {
      return Math.floor(state.product / 10) === value
        ? {phase: 'ones', product: state.product}
        : undefined;
    }
    return state.product % 10 === value
      ? {phase: 'done', product: state.product}
      : undefined;
  },
  accept: state => state.phase === 'done',
  // Five cage cells, one segment break, and two displayed digits.
  maxDepth: 8,
}, 9, {multiSegment: true});

const productConstraints = productCages.map((cage, index) => new NFA(
  productSpec,
  `product cage ${index + 1}`,
  cage,
  ['R1C8', 'R1C9'],
));

const sumConstraints = sumCages.map(cage => new Sum(
  0,
  ...cage,
  ['R2C8', -10],
  ['R2C9', -1],
));

return [
  new Shape('9x9'),
  ...sumConstraints,
  ...productConstraints,
];
