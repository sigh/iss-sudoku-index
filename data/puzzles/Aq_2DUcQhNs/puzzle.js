// Title: Loony Tune
// Author: billybeth
// Video: https://www.youtube.com/watch?v=Aq_2DUcQhNs
// Source: https://sudokupad.app/98offhjkjo

// Normal sudoku rules apply.
//
// The red and yellow lines are a famous tune put into C major using notes
// of the scale from 1 to 5 (1=C, 2=D, ... 5=G). Read in order, the digits
// along each line are the tune's note numbers, so every cell on either
// line holds a digit from 1 to 5. (Which specific tune is spelled out is a
// solving-time flavor reveal, not a checkable rule; the enforceable
// constraint is the 1-5 digit restriction on every cell of both lines.)
//
// On a green line, adjacent digits have a difference of at least 5
// (German Whispers).
//
// A purple line contains a set of non-repeating consecutive digits, in
// any order (Renban).

const yellowLine = [
  'R3C3', 'R2C4', 'R2C5', 'R2C6', 'R3C7', 'R4C8', 'R5C8', 'R6C8', 'R6C9',
  'R7C8', 'R7C7', 'R7C6', 'R6C5', 'R5C4', 'R4C3',
];

const redLine = [
  'R8C3', 'R9C4', 'R8C5', 'R7C6', 'R7C7', 'R7C8', 'R6C9', 'R6C8', 'R5C8',
  'R4C8', 'R3C7', 'R2C6', 'R2C5', 'R2C4', 'R3C3',
];

const greenWhisperLines = [
  ['R6C6', 'R5C7', 'R4C6', 'R4C7', 'R3C6', 'R4C5', 'R3C5', 'R4C4'],
  ['R7C4', 'R6C4', 'R5C3', 'R4C2', 'R3C2', 'R2C3', 'R1C2', 'R2C1', 'R1C1', 'R2C2'],
];

const purpleRenbanLines = [
  ['R9C5', 'R9C6', 'R8C6'],
  ['R1C9', 'R2C9'],
  ['R8C7', 'R8C8', 'R9C8', 'R9C9', 'R8C9', 'R7C9'],
  ['R8C4', 'R7C5'],
  ['R4C9', 'R5C9'],
  ['R7C3', 'R7C2', 'R8C2', 'R8C1', 'R9C1', 'R9C2', 'R9C3'],
  ['R1C8', 'R2C8', 'R3C8'],
  ['R5C5', 'R6C6'],
  ['R5C7', 'R6C7'],
  ['R5C1', 'R6C1', 'R6C2', 'R6C3', 'R5C3'],
  ['R1C4', 'R1C5'],
];

const scaleCells = [...new Set([...yellowLine, ...redLine])];

const constraints = [
  new Shape('9x9'),
];

for (const cell of scaleCells) {
  constraints.push(new Given(cell, 1, 2, 3, 4, 5));
}

for (const cells of greenWhisperLines) {
  constraints.push(new Whisper(5, ...cells));
}

for (const cells of purpleRenbanLines) {
  constraints.push(new Renban(...cells));
}

return constraints;
