// Title: Filaments
// Author: Skunkworks
// Video: https://www.youtube.com/watch?v=v36A7Uvn9Vs
// Source: https://sudokupad.app/d3ogeeiymu

// Normal sudoku rules apply. Six lines are drawn; the ruleset states "All
// lines in this puzzle conform to both rulesets", so every line below is
// encoded twice: once as a RegionSumLine (equal sum per box segment) and
// once as an Entropic line (each sequential run of 3 cells contains one low
// {1,2,3}, one mid {4,5,6}, one high {7,8,9} digit).

// Cell sequence for each drawn line, in drawn order (order is irrelevant to
// RegionSumLine/Entropic semantics, which are order-of-traversal along the
// line, not direction-sensitive for either rule as stated).
const lines = [
  ['R1C4', 'R2C4', 'R3C5', 'R4C5', 'R5C4', 'R5C3', 'R4C2', 'R4C1'],
  ['R1C6', 'R1C7', 'R2C8'],
  ['R1C5', 'R2C5', 'R2C6', 'R2C7', 'R3C8', 'R4C8', 'R5C8', 'R5C9'],
  ['R6C9', 'R6C8', 'R5C7', 'R5C6', 'R6C5', 'R7C5', 'R8C6', 'R9C6'],
  ['R9C5', 'R8C5', 'R8C4', 'R8C3', 'R7C2', 'R6C2', 'R5C2', 'R5C1'],
  ['R6C1', 'R7C1', 'R8C2'],
];

return [
  new Shape('9x9'),
  new Given('R1C1', 5),
  new Given('R3C2', 9),
  new Given('R4C6', 4),
  new Given('R6C7', 6),
  new Given('R7C4', 8),
  new Given('R7C9', 1),
  new Given('R8C1', 2),
  new Given('R8C9', 3),
  new Given('R9C7', 7),
  ...lines.map((cells) => new RegionSumLine(...cells)),
  ...lines.map((cells) => new Entropic(...cells)),
];
