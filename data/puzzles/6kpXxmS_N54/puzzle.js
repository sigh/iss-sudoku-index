// Title: Breadcrumbs
// Author: Belamis
// Video: https://www.youtube.com/watch?v=6kpXxmS_N54
// Source: https://sudokupad.app/jfyralmfoe

const parityLines = [
  ['R6C1', 'R6C2', 'R6C3'],
  ['R7C9', 'R8C9', 'R9C9'],
  ['R4C6', 'R4C7', 'R5C7'],
];
const cageCells = [
  ['R1C9', 'R2C9'],
  ['R3C3', 'R3C4'],
  ['R8C2', 'R9C2'],
];
const blackDots = [
  ['R5C1', 'R5C2'],
  ['R5C2', 'R5C3'],
  ['R6C7', 'R7C7'],
];
const zipperLines = [
  ['R6C4', 'R5C4', 'R6C5', 'R5C6', 'R5C5'],
  ['R1C7', 'R2C6', 'R3C7'],
];
const thermometers = [
  ['R7C1', 'R8C1', 'R9C1'],
  ['R1C2', 'R2C2', 'R3C2'],
  ['R8C5', 'R7C5', 'R7C6'],
];
const evenSquares = ['R6C9', 'R9C4'];

const flattenUnique = groups => [...new Set(groups.flat())];
const parityKey = Pair.fnToKey((a, b) => (a + b) % 2 === 1, 9);

return [
  new Shape('9x9'),

  // Adjacent digits alternate parity on each red line.
  ...parityLines.map(cells => new Pair(parityKey, 'Parity Line', ...cells)),

  new Cage(6, ...cageCells[0]),
  new Cage(8, ...cageCells[1]),
  new Cage(10, ...cageCells[2]),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...zipperLines.map(cells => new Zipper(...cells)),
  ...thermometers.map(cells => new Thermo(...cells)),

  // The inward-arrow cell is smaller than each orthogonal neighbour.
  new GreaterThan('R2C8', 'R3C8'),
  new GreaterThan('R3C7', 'R3C8'),
  new GreaterThan('R3C9', 'R3C8'),
  new GreaterThan('R4C8', 'R3C8'),
  new Given('R6C9', 2, 4, 6, 8),
  new Given('R9C4', 2, 4, 6, 8),

  // No digit repeats across all cells carrying the same clue type.
  new AllDifferent(...flattenUnique(parityLines)),
  new AllDifferent(...flattenUnique(cageCells)),
  new AllDifferent(...flattenUnique(blackDots)),
  new AllDifferent(...flattenUnique(zipperLines)),
  new AllDifferent(...flattenUnique(thermometers)),
  new AllDifferent(...evenSquares),
];
