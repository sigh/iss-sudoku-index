// Title: Subzero2
// Author: Pacattack25 & Schwupel
// Video: https://www.youtube.com/watch?v=g9JMdfC8xG0
// Source: https://app.crackingthecryptic.com/sudoku/mNj477fmL9

// Normal sudoku rules apply, standard 3x3 boxes, no givens. Hot/cold shading
// is the YinYang constraint's YY cell group. Along each grey thermometer
// (bulb first below), signed values -- positive on a hot cell, negative on
// a cold cell -- strictly increase from bulb to tip.

const HOT = 1;
const COLD = 2;

const graph = cellGraph('9x9');
const state = graph.makeOverlay('YY');
const stateCell = cell => state.at(cell);

// Interleaves each path cell's hot/cold state with its digit; state 1 means
// positive and 2 means negative. The machine remembers the prior signed
// value while reading the path bulb-first.
const thermoNFA = NFA.encodeSpec({
  startState: { phase: 0, sign: 0, previous: null },
  transition: ({ phase, sign, previous }, value) => {
    if (phase === 0) {
      if (value !== HOT && value !== COLD) return undefined;
      return { phase: 1, sign: value === HOT ? 1 : -1, previous };
    }
    const signed = sign * value;
    if (previous !== null && signed <= previous) return undefined;
    return { phase: 0, sign: 0, previous: signed };
  },
  accept: ({ phase, previous }) => phase === 0 && previous !== null,
}, 9);

// The seven grey thermometer paths, bulb first. Cell order and bulb ends
// are transcribed from the drawn grey lines and their filled-circle bulb
// markers.
const thermometers = [
  ['R1C5', 'R1C4', 'R2C3', 'R3C2', 'R4C2', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C3', 'R8C2'],
  ['R1C3', 'R2C4', 'R3C4', 'R3C5', 'R2C5', 'R1C6', 'R1C7'],
  ['R7C5', 'R6C4', 'R5C4', 'R4C5', 'R4C6', 'R4C7', 'R3C8', 'R2C8', 'R1C9'],
  ['R7C2', 'R7C1'],
  ['R8C4', 'R9C4', 'R9C5', 'R9C6'],
  ['R8C7', 'R7C7', 'R8C8'],
  ['R6C6', 'R5C7'],
];

return [
  new Shape('9x9'),
  new YinYang(),
  ...thermometers.map(cells => new NFA(thermoNFA, 'signed thermometer',
    ...cells.flatMap(cell => [stateCell(cell), cell]))),
];
