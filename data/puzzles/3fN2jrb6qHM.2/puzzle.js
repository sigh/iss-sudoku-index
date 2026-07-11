// Title: 5 Worms and a Dream
// Author: Cassinii
// Video: https://www.youtube.com/watch?v=3fN2jrb6qHM
// Source: https://sudokupad.app/0tzwa8vtfv

// Place the digits 1-6 once each in every row, column, and irregular
// (jigsaw) region. Digits on a magenta line form a non-repeating
// consecutive set, in any order. Where a V sits on the border between two
// cells, it points to the smaller of the two digits.

const regions = [
  ['R1C3', 'R2C3', 'R3C3', 'R3C4', 'R4C4', 'R5C4'],
  ['R1C4', 'R1C5', 'R1C6', 'R2C4', 'R2C6', 'R3C6'],
  ['R2C5', 'R3C5', 'R4C5', 'R4C6', 'R5C6', 'R6C6'],
  ['R5C2', 'R5C5', 'R6C2', 'R6C3', 'R6C4', 'R6C5'],
  ['R4C1', 'R4C2', 'R4C3', 'R5C1', 'R5C3', 'R6C1'],
  ['R1C1', 'R1C2', 'R2C1', 'R2C2', 'R3C1', 'R3C2'],
];

const renbanLines = [
  ['R3C2', 'R4C2', 'R4C3', 'R5C3', 'R5C4', 'R5C5'],
  ['R5C1', 'R6C1', 'R6C2'],
  ['R3C5', 'R3C6', 'R2C6'],
  ['R1C4', 'R1C3', 'R1C2'],
  ['R6C5', 'R6C6'],
];

const constraints = [
  new Shape('6x6'),
  new NoBoxes(),
];

for (const region of regions) {
  constraints.push(new AllDifferent(...region));
}

for (const line of renbanLines) {
  constraints.push(new Renban(...line));
}

// V clue between R5C6 and R6C6, pointing to the smaller digit: R6C6.
constraints.push(new GreaterThan('R5C6', 'R6C6'));

return constraints;
