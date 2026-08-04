// Title: Temperature Inversion
// Author: Die Hard
// Video: https://www.youtube.com/watch?v=kB-Zgj7-NVU
// Source: https://app.crackingthecryptic.com/sudoku/qjhGjL3B3T

// Normal sudoku rules apply. Digits on the marked diagonal (R1C1-R9C9) must
// not repeat. Digits a king's move apart must not repeat. Every thermometer
// is strictly increasing from its bulb and holds either all-odd or all-even
// digits. Most thermometers are bidirectional: which end is the bulb is not
// shown, so both orientations are tried. The blue and red thermometers have
// their bulb drawn (deepskyblue/red underlay), and additionally: the blue
// bulb digit is lower than the red bulb digit, and the blue thermometer's
// digit sum is lower than the red thermometer's.

// Bulb-known thermometers, bulb cell first (underlay colour fixes the bulb;
// wayPoints order then fixes the rest of the run).
const BLUE_CELLS = ['R6C7', 'R7C8', 'R7C9', 'R8C9'];
const RED_CELLS = ['R3C4', 'R2C3', 'R1C3', 'R1C2'];

// Bidirectional thermometers (bulb end unknown), as drawn.
const UNKNOWN_THERMOS = [
  ['R7C6', 'R8C7', 'R9C7', 'R9C8'],
  ['R6C8', 'R5C9', 'R4C8'],
  ['R3C9', 'R2C9', 'R1C8', 'R1C7'],
  ['R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3'],
  ['R7C1', 'R8C1', 'R9C2', 'R9C3'],
  ['R4C2', 'R5C1', 'R6C2'],
  ['R4C3', 'R3C2', 'R3C1', 'R2C1'],
];

const ODD = [1, 3, 5, 7, 9];
const EVEN = [2, 4, 6, 8];

// One thermometer, bulb-first cell order: increasing from the bulb, restricted
// to one parity (tried as two branches -- which parity is not fixed by the rules).
const parityBranches = (bulbFirstCells) => [ODD, EVEN].map(set => new And([
  new Thermo(...bulbFirstCells),
  ...bulbFirstCells.map(c => new Given(c, ...set)),
]));

const knownDirectionThermo = (bulbFirstCells) => new Or(parityBranches(bulbFirstCells));

// Bulb end unknown: also try the reversed cell order.
const unknownDirectionThermo = (cells) => new Or([
  ...parityBranches(cells),
  ...parityBranches([...cells].reverse()),
]);

// Blue bulb colder (lower) than red bulb.
const bulbColderKey = Pair.fnToKey((a, b) => a < b, 9);

// Blue thermometer's digit sum lower than red thermometer's. Tracks the
// running difference (blue contributions positive, red negative) across both
// segments in one pass and accepts when it finishes negative; carrying the
// difference instead of both totals keeps the compiled state small (totals
// range 4-36, which would not fit a widened Var domain anyway).
const sumCompareSpec = NFA.encodeSpec({
  startState: { diff: 0, seg: 'blue' },
  transition: ({ diff, seg }, value) => {
    if (value === SEGMENT_BREAK) return { diff, seg: 'red' };
    return { diff: seg === 'blue' ? diff + value : diff - value, seg };
  },
  accept: ({ diff }) => diff < 0,
  // 8 real cells + 1 SEGMENT_BREAK between the two 4-cell segments; bounds
  // state creation so `diff` cannot climb unboundedly.
  maxDepth: 9,
}, 9, { multiSegment: true });

return [
  new Shape('9x9'),
  new Diagonal(-1),
  new AntiKing(),

  knownDirectionThermo(BLUE_CELLS),
  knownDirectionThermo(RED_CELLS),
  ...UNKNOWN_THERMOS.map(unknownDirectionThermo),

  new Pair(bulbColderKey, 'BlueBulbColderThanRedBulb', BLUE_CELLS[0], RED_CELLS[0]),
  new NFA(sumCompareSpec, 'BlueSumLowerThanRedSum', BLUE_CELLS, RED_CELLS),
];
