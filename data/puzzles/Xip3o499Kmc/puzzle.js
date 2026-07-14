// Title: Top Right Boi
// Author: PhoenixAki
// Video: https://www.youtube.com/watch?v=Xip3o499Kmc
// Source: https://sudokupad.app/3alsxsnq4t

// Normal Sudoku rules are supplied by Shape. The arrays below preserve each
// independently drawn clue; regional all-different constraints are formed from
// the union of the cells belonging to each clue type.
const renbans = [
  ['R8C1', 'R8C2', 'R9C2'],
  ['R5C4', 'R5C5', 'R6C5'],
  ['R2C7', 'R2C8', 'R3C8'],
];

const cages = [
  [19, ['R5C7', 'R5C8', 'R6C8']],
  [19, ['R8C4', 'R8C5', 'R9C5']],
  [7, ['R2C1', 'R2C2', 'R3C2']],
];

const dots = [
  ['R2C5', 'R3C5'],
  ['R7C5', 'R7C6'],
];

const whispers = [
  ['R5C1', 'R6C2', 'R6C3', 'R5C3'],
  ['R7C7', 'R8C7'],
];

// Each arrow lists its circle first, followed by its arm in drawn order.
const arrows = [
  ['R1C9', 'R2C9', 'R1C8'],
  ['R4C9', 'R5C9', 'R4C8', 'R4C7'],
];

// Only the marked cells, not their neighbours, constitute maximum clues for
// the regional rule. Each GreaterThan list starts with the marked maximum.
const maxima = [
  ['R3C4', 'R2C4', 'R3C3', 'R3C5', 'R4C4'],
  ['R7C2', 'R6C2', 'R7C1', 'R7C3', 'R8C2'],
];

// [largest cell, all cells in that clue]. The largest cell is always the
// rightmost cell of the clue's topmost occupied row.
const topRightClues = [
  ['R8C2', renbans[0]],
  ['R5C5', renbans[1]],
  ['R2C8', renbans[2]],
  ['R5C8', cages[0][1]],
  ['R8C5', cages[1][1]],
  ['R2C2', cages[2][1]],
  ['R2C5', dots[0]],
  ['R7C6', dots[1]],
  ['R5C3', whispers[0]],
  ['R7C7', whispers[1]],
  ['R1C9', arrows[0]],
  ['R4C9', arrows[1]],
];

const greaterThanKey = Pair.fnToKey((a, b) => a > b, 9);
const topRightConstraints = topRightClues.flatMap(([largest, cells]) =>
  cells
    .filter(cell => cell !== largest)
    .map(cell => new Pair(greaterThanKey, 'top-right-largest', largest, cell)));

const clueTypeRegions = [
  renbans.flat(),
  cages.flatMap(([, cells]) => cells),
  dots.flat(),
  whispers.flat(),
  arrows.flat(),
  maxima.map(([cell]) => cell),
];

return [
  new Shape('9x9'),
  ...renbans.map(cells => new Renban(...cells)),
  ...cages.map(([total, cells]) => new Cage(total, ...cells)),
  ...dots.map(cells => new BlackDot(...cells)),
  ...whispers.map(cells => new Whisper(5, ...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
  ...maxima.map(cells => new GreaterThan(...cells)),
  ...topRightConstraints,
  ...clueTypeRegions.map(cells => new AllDifferent(...cells)),
];
