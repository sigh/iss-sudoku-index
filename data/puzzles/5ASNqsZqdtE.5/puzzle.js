// Title: 7/17/22: Connect The Dots
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=5ASNqsZqdtE
// Source: https://tinyurl.com/4udnfdk5

// Normal sudoku, no givens. Fourteen 2-cell killer cages (distinct digits
// summing to the cage total). White dots join cells that must be
// consecutive; black dots join cells with a 2:1 ratio. Both dot lists come
// from the payload's plain `difference`/`ratio` clues, which carry no
// explicit value: the rules text fixes the default difference at 1 (white)
// and the default ratio at 2 (black). Several dots sit on top of a cage's
// own two cells -- both constraints then apply to that pair. No negative
// constraint: adjacent pairs without a drawn dot are not restricted.

const cages = [
  new Cage(3, 'R1C1', 'R1C2'),
  new Cage(4, 'R2C3', 'R2C4'),
  new Cage(5, 'R3C5', 'R3C6'),
  new Cage(6, 'R2C7', 'R2C8'),
  new Cage(17, 'R9C8', 'R9C9'),
  new Cage(16, 'R8C6', 'R8C7'),
  new Cage(15, 'R7C4', 'R7C5'),
  new Cage(14, 'R8C2', 'R8C3'),
  new Cage(13, 'R6C1', 'R6C2'),
  new Cage(7, 'R4C8', 'R4C9'),
  new Cage(8, 'R5C7', 'R5C8'),
  new Cage(9, 'R6C6', 'R6C7'),
  new Cage(12, 'R5C2', 'R5C3'),
  new Cage(11, 'R4C3', 'R4C4'),
];

const whiteDots = [
  ['R3C5', 'R3C6'],
  ['R4C8', 'R4C9'],
  ['R6C6', 'R6C7'],
  ['R4C3', 'R4C4'],
  ['R6C1', 'R6C2'],
  ['R7C4', 'R7C5'],
  ['R9C8', 'R9C9'],
  ['R7C7', 'R8C7'],
  ['R8C1', 'R8C2'],
  ['R2C8', 'R2C9'],
  ['R6C9', 'R7C9'],
];

const blackDots = [
  ['R1C1', 'R1C2'],
  ['R2C7', 'R2C8'],
  ['R5C2', 'R5C3'],
  ['R2C3', 'R3C3'],
  ['R3C1', 'R4C1'],
];

return [
  new Shape('9x9'),
  ...cages,
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
