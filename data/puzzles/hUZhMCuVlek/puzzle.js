// Title: Kalimba
// Author: Aron Lide (Aspartagcus)
// Video: https://www.youtube.com/watch?v=hUZhMCuVlek
// Source: https://sudokupad.app/Bqqp8Fr3PH

// Normal Sudoku rules apply.  From each grey bulb to its tip, its thermometer
// may stay level or increase.  The paths are transcribed from the grey drawn lines.
const nondecreasing = Pair.fnToKey((a, b) => a <= b, 9);
const thermometers = [
  ['R9C3', 'R8C4', 'R7C5', 'R6C6', 'R5C7'],
  ['R7C2', 'R6C3', 'R5C4', 'R4C5', 'R3C6', 'R2C7', 'R1C8'],
  ['R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9'],
  ['R9C2', 'R8C3', 'R7C4', 'R6C5', 'R5C6', 'R4C7', 'R3C8'],
  ['R6C2', 'R5C3', 'R4C4', 'R3C5', 'R2C6', 'R1C7'],
  ['R9C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8'],
  ['R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9'],
  ['R5C2', 'R4C3', 'R3C4'],
];

return [
  new Shape('9x9'),
  ...thermometers.map(cells => new Pair(nondecreasing, 'nondecreasing thermometer', ...cells)),
];
