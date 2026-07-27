// Title: Perfect Triple
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=TGcXylWOT4E
// Source: https://sudokupad.app/wtvea3yu16

// Rules encoded:
// - "Use exactly six digits from 1-9 to fill the grid, with each digit
//   appearing once in every row, column and box." Which six digits is for
//   the solver to work out: widen the alphabet to 1-9 and force every row,
//   column, and box (all size 6, all the grid's largest regions) to agree
//   on the same six-digit set via RegionSameValues -- the standard
//   unknown-digit-set pattern.
// - "A digit in a diamond is the square root of the sum of the digits along
//   the arrow." Each diamond's centre coincides exactly with the first
//   waypoint of one arrow (payload `arrows[].wayPoints`), matching the usual
//   arrow bulb/arm convention: the diamond cell itself is excluded from
//   "the digits along the arrow". There is no native squared-sum class, so
//   each arrow is expanded into one branch per possible bulb digit 1-9: the
//   bulb is pinned to d and the arm cells must sum to d*d.

// Diamond (bulb) cell and its arrow's arm cells, read off the drawn arrow
// geometry -- each arrow's wayPoints interpolated to a cell path, with the
// diamond sitting on the path's first cell.
const arrows = [
  { bulb: 'R1C4', arm: ['R2C4', 'R2C3', 'R1C2', 'R2C1', 'R3C2'] },
  { bulb: 'R2C2', arm: ['R3C3', 'R3C4'] },
  { bulb: 'R4C5', arm: ['R3C5', 'R2C5', 'R1C5', 'R1C6', 'R2C6', 'R3C6'] },
  { bulb: 'R5C5', arm: ['R5C4', 'R5C3', 'R5C2', 'R5C1', 'R4C1', 'R4C2', 'R4C3', 'R4C4'] },
  { bulb: 'R6C4', arm: ['R6C5', 'R6C6'] },
];

const sqrtArrows = arrows.map(({ bulb, arm }) => new Or(
  Array.from({ length: 9 }, (_, i) => i + 1).map(d => new And([
    new Given(bulb, d),
    new Sum(d * d, ...arm),
  ]))
));

return [
  new Shape('6x6', 9),
  new RegionSameValues(),
  ...sqrtArrows,
];
