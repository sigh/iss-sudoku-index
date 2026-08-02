// Title: Chemistry is like a puzzle...
// Author: Sumanta (ANU)
// Video: https://www.youtube.com/watch?v=mv4yEi3b--I
// Source: https://app.crackingthecryptic.com/m8ptLFdQ3R

// Normal Sudoku rules apply. The purple line is entropic; each consecutive
// triple has one digit from each of 1-3, 4-6, and 7-9. Grey lines are
// thermometers from their circular bulbs. White and black dots mean consecutive
// digits and a 1:2 ratio respectively. Cell shading is decorative.
const entropy = [
  'R2C3', 'R3C3', 'R4C3', 'R5C3', 'R6C2', 'R7C1', 'R8C1', 'R9C1',
  'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9',
  'R8C9', 'R7C9', 'R6C8', 'R5C7', 'R4C7', 'R3C7', 'R2C7',
];

const whiteDots = [
  ['R1C5', 'R1C6'], ['R5C4', 'R5C5'], ['R6C4', 'R7C4'],
  ['R6C5', 'R7C5'], ['R6C6', 'R7C6'], ['R7C3', 'R8C3'],
  ['R7C7', 'R8C7'], ['R7C8', 'R8C8'],
];

return [
  new Shape('9x9'),
  new Entropic(...entropy),
  new Thermo('R1C2', 'R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C8'),
  new Thermo('R5C1', 'R4C1'),
  new Thermo('R5C9', 'R4C9'),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  new BlackDot('R7C2', 'R8C2'),
];
