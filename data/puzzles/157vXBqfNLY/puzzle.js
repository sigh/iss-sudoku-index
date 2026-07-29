// Title: Where does it all end?
// Author: apetersen
// Video: https://www.youtube.com/watch?v=157vXBqfNLY
// Source: https://sudokupad.app/lc3vr050ng

// Normal sudoku rules apply. The grey square at R2C5 is even. Each path's
// endpoint boxes select its line rule(s): Ten Line, Renban, German Whisper,
// Same Difference, Between, Modular, Nabner, Region Sum, and Entropic.
// Fog/reveal is UI-only and is not a grid constraint.

// Drawn coloured paths, transcribed in their source order.
const red = ['R1C7', 'R1C6', 'R1C5', 'R2C5', 'R2C4', 'R2C3', 'R2C2'];
const orange = ['R2C8', 'R3C8', 'R3C9', 'R4C9', 'R4C8'];
const yellow = ['R3C5', 'R3C6', 'R3C7', 'R4C7', 'R5C7', 'R5C6', 'R6C6', 'R7C6', 'R7C5'];
const green = ['R8C4', 'R7C4', 'R6C4', 'R5C4', 'R5C5'];
const lightBlue = ['R4C4', 'R4C5', 'R4C6'];
const pink = ['R8C9', 'R7C9', 'R6C9', 'R6C8'];
const lightGrey = ['R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3'];
const grey = ['R8C3', 'R7C3', 'R6C3'];
const black = ['R8C8', 'R9C8', 'R9C9'];
const blue = ['R6C7', 'R7C7', 'R8C7'];
const purple = ['R4C1', 'R5C1', 'R6C1'];

// A Same Difference line has one nonzero absolute difference on every edge.
const differenceKeys = Array.from({ length: 8 }, (_, index) => {
  const difference = index + 1;
  return Pair.fnToKey((a, b) => Math.abs(a - b) === difference, 9);
});
const sameDifference = cells => new Or(differenceKeys.map((key, index) =>
  new Pair(key, `same difference ${index + 1}`, ...cells)
));

// Nabner applies to every pair on its path, not just consecutive path cells.
const nabnerKey = PairX.fnToKey((a, b) => Math.abs(a - b) > 1, 9);

return [
  new Shape('9x9'),
  new Given('R2C5', 2, 4, 6, 8),

  new Whisper(5, ...red),
  new SumLine(10, ...red),
  new Whisper(5, ...orange),
  new Modular(3, ...orange),
  new Renban(...yellow),
  new RegionSumLine(...yellow),
  new RegionSumLine(...green),
  new Between(...green),
  new Between(...lightBlue),
  new Entropic(...pink),
  new Modular(3, ...pink),
  new Entropic(...lightGrey),
  new PairX(nabnerKey, 'nabner', ...lightGrey),
  new PairX(nabnerKey, 'nabner', ...grey),
  sameDifference(grey),
  new Entropic(...black),
  new Modular(3, ...blue),
  new Entropic(...blue),
  sameDifference(purple),
];
