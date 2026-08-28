// Title: The Aquarium
// Author: rubenscube
// Video: https://www.youtube.com/watch?v=DUlfr6jmaNA
// Source: https://tinyurl.com/The-Aquarium

// Normal sudoku rules apply. Digits along thermometers increase from the
// bulb end (Thermo enforces exactly that, bulb-first per the f-puzzles
// convention). Cells with a grey square must hold an even digit -- there is
// no Even class, so each is a multi-value Given restricting candidates to
// {2,4,6,8}. Adjacent digits along the green line differ by at least 5
// (Whisper defaults to difference 5, matching a German whisper line).

// Thermometer cell lists, bulb-first; transcribed from the payload's
// `thermometer` array (each entry's first cell is the bulb).
const thermos = [
  ['R3C2', 'R2C3', 'R1C2'],
  ['R3C5', 'R2C6', 'R1C5'],
  ['R3C8', 'R2C9', 'R1C8'],
  ['R6C8', 'R5C9', 'R4C8'],
  ['R6C5', 'R5C6', 'R4C5'],
  ['R6C2', 'R5C3', 'R4C2'],
  ['R9C2', 'R8C3', 'R7C2'],
  ['R9C5', 'R8C6', 'R7C5'],
  ['R9C8', 'R8C9', 'R7C8'],
  ['R7C7', 'R8C7'],
  ['R4C7', 'R5C7'],
  ['R1C7', 'R2C7'],
  ['R1C4', 'R2C4'],
  ['R4C4', 'R5C4'],
  ['R7C4', 'R8C4'],
  ['R7C1', 'R8C1'],
  ['R4C1', 'R5C1'],
  ['R1C1', 'R2C1'],
];

// Grey-square (even) cells; from the payload's `even` array.
const evenCells = [
  'R3C3', 'R3C6', 'R3C9', 'R6C9', 'R6C6', 'R6C3', 'R9C3', 'R9C6', 'R9C9',
];

return [
  new Shape('9x9'),
  ...thermos.map(cells => new Thermo(...cells)),
  ...evenCells.map(cell => new Given(cell, 2, 4, 6, 8)),
  new Whisper('R5C6', 'R6C7', 'R7C7'),
];
