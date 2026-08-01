// Title: Year of the Dragon
// Author: Marushia Dark
// Video: https://www.youtube.com/watch?v=FshZDLZm-zU
// Source: https://sudokupad.app/bDLDDJTNLG

// Normal sudoku. Adjacent cells on each coloured stroke differ by at least the
// digit in that colour's reference cell. The grey and connected purple strokes
// are renbans. The two deduced dragon paths are omitted.
const greyWhisper = NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, limit: value };
    if (s.k === 1) return { k: 2, limit: s.limit, first: value };
    if (s.k === 2) return Math.abs(s.first - value) >= s.limit ? { done: true } : undefined;
    return undefined;
  },
  accept: s => s.done === true,
}, 9);

// Paths transcribed from the coloured line strokes in the drawing.
const purple = [
  ['R1C2', 'R2C3', 'R2C4', 'R3C3'],
  ['R2C3', 'R2C2', 'R2C1', 'R3C2'],
];
const purpleCells = ['R1C2', 'R2C3', 'R2C4', 'R3C3', 'R2C2', 'R2C1', 'R3C2'];
const green = ['R1C6', 'R2C6', 'R3C6', 'R3C7', 'R3C8', 'R4C7', 'R4C6',
  'R5C6', 'R6C6', 'R7C6', 'R8C7', 'R8C8', 'R8C9', 'R7C9'];
const brown = [
  ['R4C3', 'R4C2', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1'],
  ['R5C2', 'R5C1', 'R6C1', 'R6C2'],
  ['R5C6', 'R5C7', 'R5C8'],
  ['R2C6', 'R2C7', 'R2C8'],
];
const blue = [
  ['R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C3', 'R7C2'],
  ['R6C6', 'R6C7', 'R6C8'],
  ['R3C3', 'R3C2', 'R3C1'],
];

return [
  new Shape('9x9'),
  new Given('R1C1', 3), new Given('R9C1', 4),
  new Given('R9C3', 2), new Given('R9C6', 5),

  ...purple.map(cells => new Whisper(3, ...cells)),
  new Whisper(5, ...green),
  ...brown.map(cells => new Whisper(4, ...cells)),
  ...blue.map(cells => new Whisper(2, ...cells)),
  new NFA(greyWhisper, 'grey value-whisper', 'R1C8', 'R7C8', 'R7C7'),
  new NFA(greyWhisper, 'grey value-whisper', 'R1C8', 'R7C7', 'R7C6'),
  new Renban('R7C8', 'R7C7', 'R7C6'),
  new Renban(...purpleCells),
];
