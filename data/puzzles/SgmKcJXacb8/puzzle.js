// Title: Moving On Up
// Author: ChinStrap
// Video: https://www.youtube.com/watch?v=SgmKcJXacb8
// Source: https://sudokupad.app/7r5ntg3bu7

// The source is an 11x11 frame around a normal 9x9 Sudoku. The 36 outside
// frame cells are fillable numbered-room clues, represented by Var cells.
// Each variable clue equals the grid digit selected by the first grid digit
// in its inward sight line.

const graph = cellGraph('9x9');

// Outside cells are listed in slow-thermometer order from the bulb. Their
// source coordinates are on the 11x11 canvas, whose central R2C2-R10C10
// corresponds to ISS R1C1-R9C9.
const outside = [
  {source: [11, 5], cell: 'VO1'},
  {source: [11, 4], cell: 'VO2'},
  {source: [11, 3], cell: 'VO3'},
  {source: [11, 2], cell: 'VO4'},
  {source: [10, 1], cell: 'VO5'},
  {source: [9, 1], cell: 'VO6'},
  {source: [8, 1], cell: 'VO7'},
  {source: [7, 1], cell: 'VO8'},
  {source: [6, 1], cell: 'VO9'},
  {source: [5, 1], cell: 'VO10'},
  {source: [4, 1], cell: 'VO11'},
  {source: [3, 1], cell: 'VO12'},
  {source: [2, 1], cell: 'VO13'},
  {source: [1, 2], cell: 'VO14'},
  {source: [1, 3], cell: 'VO15'},
  {source: [1, 4], cell: 'VO16'},
  {source: [1, 5], cell: 'VO17'},
  {source: [1, 6], cell: 'VO18'},
  {source: [1, 7], cell: 'VO19'},
  {source: [1, 8], cell: 'VO20'},
  {source: [1, 9], cell: 'VO21'},
  {source: [1, 10], cell: 'VO22'},
  {source: [2, 11], cell: 'VO23'},
  {source: [3, 11], cell: 'VO24'},
  {source: [4, 11], cell: 'VO25'},
  {source: [5, 11], cell: 'VO26'},
  {source: [6, 11], cell: 'VO27'},
  {source: [7, 11], cell: 'VO28'},
  {source: [8, 11], cell: 'VO29'},
  {source: [9, 11], cell: 'VO30'},
  {source: [10, 11], cell: 'VO31'},
  {source: [11, 10], cell: 'VO32'},
  {source: [11, 9], cell: 'VO33'},
  {source: [11, 8], cell: 'VO34'},
  {source: [11, 7], cell: 'VO35'},
  {source: [11, 6], cell: 'VO36'},
];

const sightLine = ([sourceRow, sourceCol]) => {
  if (sourceRow === 1) return graph.column(sourceCol - 1);
  if (sourceRow === 11) return [...graph.column(sourceCol - 1)].reverse();
  if (sourceCol === 1) return graph.row(sourceRow - 1);
  return [...graph.row(sourceRow - 1)].reverse();
};

const numberedRooms = outside.map(({source, cell}) => {
  const cells = sightLine(source);
  return new ValueIndexing(cell, cells[0], ...cells);
});

// A slow thermometer is nondecreasing, unlike ISS's strict Thermo.
const slowThermoCells = [
  ...outside.map(({cell}) => cell),
  'R9C4', 'R9C3', 'R8C4', 'R9C5',
];
const slowThermoKey = Pair.fnToKey((a, b) => a <= b, 9);

return [
  new Shape('9x9'),
  new Var('O', 'Outside numbered-room cells', 36),
  ...numberedRooms,
  new Pair(slowThermoKey, 'Slow Thermometer', ...slowThermoCells),
  new WhiteDot('R2C1', 'R3C1'),
  new BlackDot('R8C9', 'R9C9'),
  new X('R6C7', 'R7C7'),
];
