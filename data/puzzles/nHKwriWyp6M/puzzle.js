// Title: Even-Tempered
// Author: Digital Flaw
// Video: https://www.youtube.com/watch?v=nHKwriWyp6M
// Source: https://app.crackingthecryptic.com/quiqc2q5o3

// Normal sudoku (rows, columns, and boxes default). Every row and column
// forbids a run of three even digits and a run of three odd digits. Thermos
// increase from their circled bulbs to their tips. Orange circles are odd;
// blue squares are even.
const noThreeSameParity = NFA.encodeSpec({
  startState: { parity: null, run: 0 },
  transition: ({ parity, run }, value) => {
    const nextParity = value % 2;
    const nextRun = nextParity === parity ? run + 1 : 1;
    return nextRun < 3 ? { parity: nextParity, run: nextRun } : undefined;
  },
  accept: () => true,
}, 9);

// Thermometer paths transcribed from the four grey bulb-and-line clues.
const thermometers = [
  ['R9C6', 'R8C6', 'R7C6', 'R6C5', 'R5C4'],
  ['R9C4', 'R8C4', 'R7C4', 'R6C3', 'R6C2'],
  ['R7C3', 'R7C2', 'R7C1', 'R8C1'],
  ['R3C6', 'R2C6', 'R1C6', 'R1C7', 'R2C8'],
];

const indices = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const rows = indices.map(row => indices.map(col => makeCellId(row, col)));
const columns = indices.map(col => indices.map(row => makeCellId(row, col)));

return [
  new Shape('9x9'),

  ...rows.map(cells => new NFA(noThreeSameParity, 'no-three-parity-run', cells)),
  ...columns.map(cells => new NFA(noThreeSameParity, 'no-three-parity-run', cells)),

  ...thermometers.map(cells => new Thermo(...cells)),

  // Orange-circle and blue-square parity clues transcribed from the underlay marks.
  new Given('R2C2', 1, 3, 5, 7, 9),
  new Given('R4C5', 1, 3, 5, 7, 9),
  new Given('R4C2', 2, 4, 6, 8),
  new Given('R5C4', 2, 4, 6, 8),
];
