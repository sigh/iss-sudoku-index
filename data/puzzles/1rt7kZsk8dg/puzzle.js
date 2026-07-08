// Title: Magnificent Mansion
// Author: Calvinball and oskode
// Video: https://www.youtube.com/watch?v=1rt7kZsk8dg
// Source: https://sudokupad.app/2th0gtj8e1

// The SudokuPad decode is an 11x11 frame around a normal 9x9 sudoku. The
// outside frame cells are fillable clue digits, so they are modeled as Var
// cells. Each outside digit uses ValueIndexing to say: the first grid digit
// from that direction selects the grid position that equals this outside digit.

const constraints = [
  new Shape('9x9'),
  new Var('O', 'Outside clue cells', 20),
];

const outsideCells = [
  ['0,1', 'VO1'], ['0,2', 'VO2'], ['0,3', 'VO3'], ['0,9', 'VO4'],
  ['1,0', 'VO5'], ['2,0', 'VO6'], ['3,0', 'VO7'], ['3,10', 'VO8'],
  ['4,10', 'VO9'], ['5,10', 'VO10'], ['6,10', 'VO11'], ['7,10', 'VO12'],
  ['8,0', 'VO13'], ['9,10', 'VO14'], ['10,2', 'VO15'], ['10,3', 'VO16'],
  ['10,6', 'VO17'], ['10,7', 'VO18'], ['10,8', 'VO19'], ['10,9', 'VO20'],
];
const outside = new Map(outsideCells);

const gridCell = (r, c) => makeCellId(r, c);
const idAt = (r, c) => outside.get(`${r},${c}`) || gridCell(r, c);

const row = (r, reverse = false) => {
  const cells = [];
  for (let c = 1; c <= 9; c++) cells.push(gridCell(r, c));
  return reverse ? cells.reverse() : cells;
};

const col = (c, reverse = false) => {
  const cells = [];
  for (let r = 1; r <= 9; r++) cells.push(gridCell(r, c));
  return reverse ? cells.reverse() : cells;
};

for (const [key, cell] of outsideCells) {
  const [r, c] = key.split(',').map(Number);
  let sightLine;
  if (r === 0) sightLine = col(c);
  else if (r === 10) sightLine = col(c, true);
  else if (c === 0) sightLine = row(r);
  else sightLine = row(r, true);
  constraints.push(new ValueIndexing(cell, sightLine[0], ...sightLine));
}

const arrowPaths = [
  [[1, 0], [2, 0], [3, 0]],
  [[3, 0], [2, 1], [1, 2], [0, 3]],
  [[0, 3], [0, 2], [0, 1]],
  [[0, 3], [1, 3], [2, 3], [3, 3], [3, 2], [3, 1], [3, 0]],
  [[0, 9], [1, 9], [2, 9], [3, 10]],
  [[4, 9], [4, 10], [5, 10], [6, 10]],
  [[6, 3], [5, 3], [4, 3], [3, 4], [3, 5], [3, 6]],
  [[8, 3], [9, 3], [10, 3], [10, 2]],
  [[10, 2], [9, 1], [8, 0]],
  [[6, 6], [7, 7], [7, 8], [7, 9], [7, 10]],
  [[9, 10], [9, 9], [10, 9], [10, 8], [9, 8], [9, 7], [10, 7], [10, 6], [9, 6]],
];

for (const path of arrowPaths) {
  constraints.push(new DoubleArrow(...path.map(([r, c]) => idAt(r, c))));
}

return constraints;
