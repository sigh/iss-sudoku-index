// Title: Sissa visits London
// Author: Patrick Junke
// Video: https://www.youtube.com/watch?v=rsAej8g0aaI
// Source: https://sudokupad.app/aojv6vyqzk

// Normal Sudoku and Sissa lines: values double in one unmarked direction,
// digits are their digital roots, and exactly one digit equals its value.
// Fog controls clue visibility only.
// Pink line paths, including cells crossed between drawn vertices.
const lines = [
  ['R5C6', 'R4C7'],
  ['R5C8', 'R5C9', 'R4C9', 'R3C9', 'R2C8', 'R2C7', 'R2C6', 'R3C6', 'R3C5', 'R4C5', 'R4C4', 'R5C4', 'R6C4', 'R6C5', 'R6C6'],
  ['R5C5', 'R4C6', 'R3C7', 'R3C8', 'R4C8'],
  ['R5C7', 'R6C7'],
  ['R3C3', 'R2C3', 'R2C2', 'R2C1', 'R3C1', 'R4C1', 'R5C1'],
  ['R6C2', 'R7C1', 'R8C2', 'R9C3', 'R8C3', 'R7C2'],
  ['R8C4', 'R9C4', 'R8C5', 'R9C5', 'R8C6'],
  ['R1C2', 'R1C3'],
];

// Positive integer values equal their digital roots precisely from 1 through 9.
// With at least two cells, exactly one match forces the initial value to 5..9:
// smaller starts have two matches; larger starts have none. Both ends may start.
const sissaLines = lines.map(cells => {
  const forward = [5, 6, 7, 8, 9].map(start =>
    cells.map((_, i) => 1 + ((start * (2 ** i) - 1) % 9)).join(''));
  const patterns = [...forward, ...forward.map(s => [...s].reverse().join(''))];
  return new Regex('(' + [...new Set(patterns)].join('|') + ')', ...cells);
});
return [new Shape('9x9'), ...sissaLines];
