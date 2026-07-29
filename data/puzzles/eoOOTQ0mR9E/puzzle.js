// Title: No XV Thermo
// Author: NurglesGift
// Video: https://www.youtube.com/watch?v=eoOOTQ0mR9E
// Source: https://sudokupad.app/M9pBJ8PhpN

// Standard 6x6 Sudoku uses 2x3 boxes. Digits increase from each gray
// thermometer's round bulb, listed first. All X and V marks are given; none
// are drawn, so no unmarked orthogonally adjacent pair may sum to 10 or 5.

const thermometers = [
  ['R2C5', 'R2C6', 'R3C6'],
  ['R2C5', 'R1C6'],
  ['R5C5', 'R6C6', 'R5C6'],
  ['R2C3', 'R3C4'],
  ['R6C2', 'R5C3', 'R5C2'],
];

return [
  new Shape('6x6'),
  ...thermometers.map(cells => new Thermo(...cells)),
  new StrictXV(),
];
