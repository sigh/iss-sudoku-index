// Title: Heat of Caged Germany
// Author: mikegood2054
// Video: https://www.youtube.com/watch?v=LzxSHijkjI8
// Source: https://sudokupad.app/kzmsrodbh6

// Normal Sudoku rules apply. The thermometer increases from its bulb; adjacent
// digits on the German Whisper differ by at least 5; cage digits are distinct
// and sum to the shown total.

const thermo = new Thermo(
  'R9C9', 'R8C8', 'R7C7', 'R6C6', 'R5C5', 'R4C4', 'R3C3', 'R2C2', 'R1C1',
);

const whisper = new Whisper(
  5,
  'R5C1', 'R5C2', 'R4C2', 'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R4C5',
  'R4C6', 'R4C7', 'R4C8', 'R5C8', 'R5C7', 'R5C6', 'R6C7', 'R7C7',
  'R8C6', 'R9C5', 'R8C4', 'R8C3',
);

const cages = [
  new Cage(16, 'R3C3', 'R3C4', 'R4C3', 'R4C4'),
  new Cage(
    45,
    'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7',
    'R3C5', 'R3C6', 'R3C7',
  ),
  new Cage(
    45,
    'R5C2', 'R5C3', 'R5C4', 'R6C2', 'R6C3', 'R6C4',
    'R7C2', 'R7C3', 'R7C4',
  ),
  new Cage(
    45,
    'R5C5', 'R5C6', 'R5C7', 'R6C5', 'R6C6', 'R6C7',
    'R7C5', 'R7C6', 'R7C7',
  ),
];

return [
  new Shape('9x9'),
  thermo,
  whisper,
  ...cages,
];
