// Title: Lost Toy (again)
// Author: Sandra & Nala
// Video: https://www.youtube.com/watch?v=fb_e9yhyMX8
// Source: https://app.crackingthecryptic.com/sudoku/7hM9J6jd6h
//
// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Digits along an arrow sum to the digit in the corresponding circle ->
// one Arrow(circle, ...arm) per arrow. Three circles each anchor two
// independent arrows; each is encoded as its own Arrow constraint.
//
// The rules also say "Elements of the same colour are connected" and
// describe fog of war clearing around correct digits. The drawn circles
// carry a fill/border colour pairing that links separate fog patches so
// clearing one clears a same-coloured patch elsewhere; this only affects
// the order/extent of fog reveal during solving, not the finished grid, so
// it is not encoded (fog/reveal state is solving UI, not a final-grid
// rule).
//
// Arrow cells were read off the drawn geometry: each arrow is a straight
// line starting at the edge of a circled cell and running through the
// remaining cells drawn along that line.
const arrows = [
  ['R8C1', 'R7C1', 'R6C1', 'R5C1'],
  ['R1C3', 'R1C4', 'R2C4', 'R3C3', 'R3C2', 'R2C2'],
  ['R3C4', 'R2C3', 'R1C2'],
  ['R1C6', 'R2C6', 'R3C7'],
  ['R1C6', 'R1C7', 'R1C8', 'R2C7'],
  ['R2C9', 'R2C8', 'R1C9'],
  ['R4C9', 'R5C9', 'R6C8', 'R5C7'],
  ['R4C2', 'R4C3', 'R4C4', 'R4C5', 'R3C5'],
  ['R8C8', 'R7C9', 'R8C9'],
  ['R8C8', 'R7C7', 'R8C7'],
  ['R3C9', 'R4C8', 'R3C7'],
  ['R7C4', 'R8C3', 'R7C3'],
  ['R7C4', 'R8C5', 'R9C4'],
  ['R6C7', 'R5C6', 'R6C6'],
  ['R6C5', 'R5C5', 'R6C4'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
];
