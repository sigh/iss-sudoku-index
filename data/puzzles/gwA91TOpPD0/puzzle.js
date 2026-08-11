// Title: High Voltage
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=gwA91TOpPD0
// Source: https://app.crackingthecryptic.com/sudoku/hhHNrNjhB9

// Normal sudoku rules apply. Six grey thermometers (bulb-first, increasing).
// Nine orange lines, each independently either a Renban (non-repeating
// consecutive set, any order) or a German Whisper (adjacent digits differ by
// >= 5); which reading applies is undeduced per line, so each is a
// disjunction. Two of the orange lines (O6, O7 below) cross at R8C5 by
// sharing that cell -- descriptive of the drawn art, not an extra rule.

// Thermometers, bulb cell first. From the grey (#CFCFCF) lines' wayPoints.
const thermos = [
  ['R5C4', 'R5C3', 'R5C2', 'R5C1'],
  ['R5C9', 'R5C8', 'R5C7', 'R5C6'],
  ['R1C3', 'R2C3', 'R3C3', 'R4C3'],
  ['R1C7', 'R2C7', 'R3C7', 'R4C7'],
  ['R6C3', 'R7C3', 'R8C3', 'R9C3'],
  ['R6C7', 'R7C7', 'R8C7', 'R9C7'],
];

// Orange lines, in drawn path order. From the orange (#EB7532) lines'
// wayPoints; O6/O7 each include a diagonal jump through R8C5.
const orangeLines = [
  ['R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7'],
  ['R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7'],
  ['R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7'],
  ['R5C6', 'R5C5', 'R5C4'],
  ['R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7'],
  ['R7C3', 'R7C4', 'R8C5', 'R9C6', 'R9C7'],
  ['R9C3', 'R9C4', 'R8C5', 'R7C6', 'R7C7'],
  ['R6C1', 'R7C1', 'R8C2'],
  ['R6C9', 'R7C8', 'R8C9'],
];

const thermoConstraints = thermos.map(cells => new Thermo(...cells));
const orangeChoices = orangeLines.map(cells => new Or([
  new Renban(...cells),
  new Whisper(5, ...cells),
]));

return [
  new Shape('9x9'),
  ...thermoConstraints,
  ...orangeChoices,
];
