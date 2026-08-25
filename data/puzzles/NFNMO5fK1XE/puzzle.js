// Title: Wave Sudoku
// Author: Madhav Sankaranarayanan
// Video: https://www.youtube.com/watch?v=NFNMO5fK1XE
// Source: https://app.crackingthecryptic.com/webapp/rNbPj8MTBb
//
// Normal sudoku rules apply (standard rows/columns/3x3 boxes).
// Digits along each blue line increase and decrease alternately: no two
// consecutive steps go the same direction. Nothing in the rules fixes which
// end of a line starts on a rise versus a fall, so each line's two
// orientations are both accepted.
//
// Cell lists below are the drawn waypoint order for each of the six real
// lines (a seventh line-style entry in the payload carries no waypoints and
// renders nothing, so it is omitted).
const waveLines = [
  ['R2C1', 'R2C2', 'R3C2', 'R4C3', 'R4C4', 'R3C5'],
  ['R3C4', 'R3C3', 'R2C3', 'R1C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9'],
  ['R5C5', 'R4C6', 'R5C6', 'R4C7'],
  ['R7C6', 'R6C7', 'R7C7', 'R6C8', 'R7C8', 'R6C9'],
  ['R7C1', 'R6C2', 'R7C2', 'R6C3', 'R7C3', 'R6C4', 'R7C4', 'R6C5'],
  ['R9C1', 'R8C2', 'R9C2', 'R8C3', 'R9C3', 'R8C4', 'R9C4', 'R8C5', 'R9C5', 'R8C6', 'R9C6', 'R8C7', 'R9C7', 'R8C8', 'R9C8'],
];

// `phase` names what the *next* step along the line must do; `prev` is the
// previous cell's value (null before the first cell is read, which is only
// recorded). Two start states let the scan begin on either a rise or a fall,
// since the rule does not fix which happens first; whichever branch keeps
// alternating survives to the end, so `accept` takes any state that got
// there.
const waveSpec = NFA.encodeSpec({
  startState: [
    { phase: 'rise', prev: null },
    { phase: 'fall', prev: null },
  ],
  transition: ({ phase, prev }, value) => {
    if (prev === null) return { phase, prev: value };
    if (phase === 'rise') {
      return value > prev ? { phase: 'fall', prev: value } : undefined;
    }
    return value < prev ? { phase: 'rise', prev: value } : undefined;
  },
  accept: () => true,
}, 9);

return [
  new Shape('9x9'),

  // Givens (drawn digits).
  new Given('R1C5', 1),
  new Given('R2C2', 6),
  new Given('R2C6', 8),
  new Given('R3C7', 8),
  new Given('R4C8', 8),
  new Given('R5C6', 4),
  new Given('R6C7', 1),
  new Given('R7C8', 5),

  ...waveLines.map((cells, i) => new NFA(waveSpec, `Wave${i + 1}`, cells)),
];
