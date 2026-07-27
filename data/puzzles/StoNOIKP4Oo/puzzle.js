// Title: Major Malfunction
// Author: Kjaji
// Video: https://www.youtube.com/watch?v=StoNOIKP4Oo
// Source: https://sudokupad.app/0k3ackq8an
//
// Rules encoded:
// - Normal sudoku (default row/col/box all-different; regions payload matches
//   the default 3x3 box tiling, so no explicit Jigsaw/NoBoxes needed).
// - Killer cages: distinct digits summing to the corner total -> Cage.
// - Thermometers: three thermometers, normally strictly increasing from the
//   bulb, but exactly one of the three is broken and strictly decreases from
//   its bulb instead. `Thermo(...cells)` enforces strictly increasing along
//   the given cell order starting at the first cell; passing a thermometer's
//   cells bulb-first gives the normal reading, and reversed (far end first)
//   gives strictly-increasing-toward-the-bulb, i.e. strictly decreasing from
//   the bulb -- the broken reading. Which single line is broken is not stated
//   by the rules, so it is modelled as a 3-way disjunction (Or) of the three
//   mutually exclusive "this one is broken, the other two are normal" cases
//   (And), rather than resolved out of band.

const cages = [
  { total: 7, cells: ['R4C1', 'R4C2'] },
  { total: 15, cells: ['R4C9', 'R5C9'] },
  { total: 14, cells: ['R4C8', 'R5C7', 'R5C8'] },
  { total: 6, cells: ['R6C8', 'R6C9', 'R7C9'] },
  { total: 31, cells: ['R5C1', 'R5C2', 'R6C1', 'R6C2', 'R6C3'] },
  { total: 11, cells: ['R1C3', 'R2C2', 'R2C3'] },
  { total: 9, cells: ['R8C3', 'R9C3'] },
  { total: 23, cells: ['R7C1', 'R7C2', 'R8C2', 'R9C2'] },
  { total: 19, cells: ['R8C5', 'R8C6', 'R9C4', 'R9C5', 'R9C6'] },
  { total: 14, cells: ['R8C9', 'R9C8', 'R9C9'] },
  { total: 15, cells: ['R7C7', 'R8C7', 'R8C8'] },
];

// Thermometer paths, bulb cell first, read off the drawn lines; each bulb is
// confirmed by a drawn circle at that same cell.
const thermos = [
  ['R3C2', 'R3C3', 'R4C4', 'R5C4', 'R6C4', 'R7C4'],
  ['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5'],
  ['R2C9', 'R2C8', 'R3C7', 'R4C7', 'R4C6', 'R5C6', 'R6C6'],
];

const brokenCases = thermos.map((_, brokenIdx) => new And(
  thermos.map((cells, i) => new Thermo(
    ...(i === brokenIdx ? [...cells].reverse() : cells)
  ))
));

return [
  new Shape('9x9'),
  ...cages.map(({ total, cells }) => new Cage(total, ...cells)),
  new Or(brokenCases),
];
