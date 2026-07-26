// Title: The Heat Between Us
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=VqGc-Frcmpc
// Source: https://sudokupad.app/1xfvrsbx6o?setting-foganim=1

// Normal sudoku rules: every row, column, and 3x3 box holds 1-9 once (the
// Shape default). No givens.
//
// Coloured lines are "edge thermos" running along cell edges. Every cell edge
// a thermo covers holds a thermo spot whose value is the sum of the two cells
// straddling that edge; spot values strictly increase moving away from the
// bulb (the large circle at one end). Each thermo is a different colour and
// thermos never overlap or intersect. A light-green stroke drawn over the
// same seven edges as the yellow thermo below carries none of the small
// edge-circle dots that mark real thermo spots elsewhere in the puzzle, so it
// is read as a decorative outline duplicating the yellow line, not a second
// overlapping thermo, and is omitted.
//
// The puzzle also drives a fog-reveal overlay (triggereffect/foglight in the
// source payload); that is solving UI, not a grid rule, and is not encoded.

// One shared NFA reused by every thermo below: it reads the straddling cells
// two at a time (one edge's pair per step) and rejects unless each edge's sum
// strictly exceeds the previous edge's sum. `cur` holds the first cell of the
// pair currently being read; `prevSum` is the last completed edge's sum (null
// before the bulb edge, which has no predecessor to exceed).
const thermoSpotMachine = NFA.encodeSpec({
  startState: { phase: 'first', prevSum: null },
  transition: ({ phase, prevSum, cur }, value) => {
    if (phase === 'first') return { phase: 'second', prevSum, cur: value };
    const sum = cur + value;
    if (prevSum !== null && sum <= prevSum) return undefined;
    return { phase: 'first', prevSum: sum };
  },
  accept: ({ phase }) => phase === 'first',
}, 9);

// Each thermo's straddling-cell pairs, in spot order, bulb first -- read from
// the drawn line waypoints and matched against that colour's edge-circle
// dots.
const thermos = {
  red: [
    ['R7C1', 'R7C2'], ['R6C2', 'R7C2'], ['R6C2', 'R6C3'], ['R5C3', 'R6C3'],
    ['R5C3', 'R5C4'], ['R4C3', 'R4C4'], ['R3C4', 'R4C4'], ['R3C5', 'R4C5'],
    ['R3C6', 'R4C6'], ['R4C6', 'R4C7'], ['R5C6', 'R5C7'], ['R5C7', 'R6C7'],
    ['R6C7', 'R6C8'], ['R6C8', 'R7C8'], ['R7C8', 'R7C9'],
  ],
  green: [
    ['R4C1', 'R4C2'], ['R3C2', 'R4C2'],
  ],
  gold: [
    ['R6C5', 'R7C5'], ['R6C5', 'R6C6'], ['R5C5', 'R6C5'], ['R5C4', 'R5C5'],
    ['R4C5', 'R5C5'],
  ],
  purple: [
    ['R9C2', 'R9C3'], ['R8C3', 'R9C3'], ['R8C3', 'R8C4'],
  ],
  skyblue: [
    ['R1C8', 'R1C9'], ['R1C8', 'R2C8'],
  ],
  yellow: [
    ['R1C3', 'R2C3'], ['R1C4', 'R2C4'], ['R2C4', 'R2C5'], ['R2C5', 'R3C5'],
    ['R2C5', 'R2C6'], ['R1C6', 'R2C6'], ['R1C7', 'R2C7'],
  ],
  mediumpurple: [
    ['R9C8', 'R9C9'], ['R8C8', 'R9C8'], ['R8C7', 'R8C8'],
  ],
};

const edgeThermos = Object.entries(thermos).map(([name, pairs]) =>
  new NFA(thermoSpotMachine, `thermo-${name}`, ...pairs.flat()));

return [
  new Shape('9x9'),
  ...edgeThermos,
];
