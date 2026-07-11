// Title: Return of the Birds
// Author: Jrosas
// Video: https://www.youtube.com/watch?v=FYaBR_jWnFs
// Source: https://sudokupad.app/p8ushghwpc

// Normal sudoku rules apply.
// White dots: the two digits differ by 1 (consecutive).
// Birds indicate ratios. Any pair of digits across a bird are in the same
// ratio to each other as are all pairs of digits across that type of bird.
// Different bird types might share a ratio, but a single bird type never
// mixes two different ratios. The ratio itself is not given for any type -
// it is only constrained to be self-consistent within the type.

const whiteDots = [
  ['R7C5', 'R8C5'],
  ['R7C5', 'R7C6'],
  ['R8C6', 'R9C6'],
];

const birdGroups = {
  rooster: [
    ['R2C1', 'R2C2'],
    ['R5C6', 'R5C7'],
    ['R3C3', 'R3C4'],
    ['R6C2', 'R6C3'],
    ['R7C4', 'R8C4'],
  ],
  turkey: [
    ['R2C8', 'R3C8'],
    ['R5C1', 'R6C1'],
    ['R6C6', 'R7C6'],
    ['R9C1', 'R9C2'],
  ],
  duck: [
    ['R8C4', 'R8C5'],
    ['R7C8', 'R8C8'],
  ],
  swan: [
    ['R6C4', 'R6C5'],
    ['R2C8', 'R2C9'],
    ['R3C3', 'R4C3'],
    ['R7C6', 'R8C6'],
    ['R9C4', 'R9C5'],
  ],
  parrot: [
    ['R2C5', 'R2C6'],
    ['R7C2', 'R8C2'],
    ['R6C7', 'R6C8'],
    ['R9C6', 'R9C7'],
    ['R5C3', 'R5C4'],
  ],
  owl: [
    ['R6C9', 'R7C9'],
    ['R5C7', 'R5C8'],
  ],
  flamingo: [
    ['R1C1', 'R1C2'],
    ['R1C5', 'R1C6'],
    ['R7C3', 'R7C4'],
  ],
  dove: [
    ['R6C1', 'R7C1'],
    ['R1C1', 'R2C1'],
  ],
};

// Reduced-fraction code for an (unordered) digit pair: hi/lo in lowest
// terms, packed as hi*10+lo. Order-independent, so it doesn't matter which
// cell of a bird is read first.
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}
function fracCode(x, y) {
  const hi = Math.max(x, y);
  const lo = Math.min(x, y);
  const g = gcd(hi, lo);
  return (hi / g) * 10 + (lo / g);
}

// Scans four cells [a1, b1, a2, b2] and accepts iff the ratio of (a1, b1)
// equals the ratio of (a2, b2). One compiled machine, reused for every pair
// of same-type bird instances - it never hardcodes a ratio value, so the
// actual ratio per bird type is left for the solver to discover.
function ratioMatchNFA() {
  return NFA.encodeSpec({
    startState: { stage: 0 },
    transition: (state, value) => {
      switch (state.stage) {
        case 0:
          return { stage: 1, a1: value };
        case 1:
          return { stage: 2, code: fracCode(state.a1, value) };
        case 2:
          return { stage: 3, code: state.code, a2: value };
        case 3:
          return { stage: 4, match: state.code === fracCode(state.a2, value) };
        default:
          return undefined;
      }
    },
    accept: state => state.stage === 4 && state.match,
  }, 9);
}

const ratioMatch = ratioMatchNFA();

const ratioConstraints = [];
for (const pairs of Object.values(birdGroups)) {
  for (let i = 0; i < pairs.length; i++) {
    for (let j = i + 1; j < pairs.length; j++) {
      const [a1, b1] = pairs[i];
      const [a2, b2] = pairs[j];
      ratioConstraints.push(
        new NFA(ratioMatch, 'same bird-type ratio', a1, b1, a2, b2));
    }
  }
}

return [
  new Shape('9x9'),

  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),

  ...ratioConstraints,
];
