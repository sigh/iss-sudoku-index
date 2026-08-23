// Title: Big Latin Y^2
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=aZcqPcSb-MY
// Source: https://sudokupad.app/cum7kp045w

// Latin square with a Yin-Yang shading. Each unlabelled YY cage balances the
// sum of its shaded digits against the sum of its unshaded digits; cage digits
// may repeat. The two grey-diamond corner cells are clones.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('YY');
const shadeOf = cell => shade.at(cell);

const cages = [
  ['R8C1', 'R8C2', 'R9C1', 'R9C2'],
  ['R8C8', 'R8C9', 'R9C8', 'R9C9'],
  ['R1C8', 'R1C9', 'R2C8', 'R2C9'],
  ['R1C1', 'R1C2', 'R2C1', 'R2C2'],
  ['R9C4', 'R9C5', 'R9C6', 'R9C7'],
  ['R1C4', 'R1C5', 'R1C6'],
  ['R4C9', 'R5C7', 'R5C8', 'R5C9', 'R6C9'],
  ['R4C1', 'R5C1', 'R5C2', 'R5C3', 'R6C1'],
  ['R6C2', 'R7C1', 'R7C2'],
  ['R3C8', 'R3C9', 'R4C8'],
  ['R6C3', 'R7C3', 'R8C3', 'R9C3'],
  ['R7C4', 'R7C5', 'R7C6'],
  ['R7C7', 'R7C8', 'R7C9'],
  ['R3C1', 'R3C2', 'R3C3'],
  ['R8C4', 'R8C5', 'R8C6', 'R8C7'],
  ['R2C7', 'R3C7', 'R4C7'],
  ['R5C4', 'R5C5', 'R5C6', 'R6C4'],
  ['R3C4', 'R3C5', 'R3C6', 'R4C6'],
];

// Scan each cage as (shade, digit) pairs. The balance adds shaded digits and
// subtracts unshaded digits; equality is exactly final balance zero. A dead
// shade value is rejected immediately and only the pending shade is retained.
const balanceMachine = NFA.encodeSpec({
  startState: { phase: 'shade', pendingShade: null, balance: 0 },
  transition: ({ phase, pendingShade, balance }, value) => {
    if (phase === 'shade') {
      if (value !== SHADED && value !== UNSHADED) return undefined;
      return { phase: 'digit', pendingShade: value, balance };
    }
    return {
      phase: 'shade',
      pendingShade: null,
      balance: balance + (pendingShade === SHADED ? value : -value),
    };
  },
  accept: ({ phase, balance }) => phase === 'shade' && balance === 0,
  maxDepth: 10,
}, 9);
const balancedCages = cages.map(cells => new NFA(
  balanceMachine,
  'YY cage balance',
  ...cells.flatMap(cell => [shadeOf(cell), cell]),
));

return [
  new Shape('9x9'),
  new NoBoxes(),
  new YinYang(),

  new Given('R5C5', 7),

  // Shade labels are interchangeable under every rule. Pin one reference
  // cell to remove only that global naming symmetry.
  new Given(shadeOf('R1C1'), SHADED),

  ...balancedCages,

  new SameValues(2, 'R1C9', 'R9C1'),
];
