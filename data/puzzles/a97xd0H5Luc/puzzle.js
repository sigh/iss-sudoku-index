// Title: FEEDING FRIENDSy: A Byte to Eat
// Author: Scojo
// Video: https://www.youtube.com/watch?v=a97xd0H5Luc
// Source: https://sudokupad.app/hba1a9t660

// Normal Sudoku, marked gears, and arrow digit inequalities are encoded.
// Omitted: maze route, its one-way crossings, robot inspection jumps,
// inspection coverage, endpoints, and the prohibition on box re-entry.
const shape = new Shape('9x9');
// Gear symbols drawn on shared cell borders.
const gears = [["R1C1", "R1C2"], ["R3C2", "R3C3"], ["R3C3", "R4C3"], ["R4C1", "R5C1"], ["R4C3", "R5C3"], ["R6C4", "R6C5"], ["R5C5", "R6C5"], ["R5C6", "R6C6"], ["R3C5", "R4C5"], ["R3C4", "R3C5"], ["R1C7", "R2C7"], ["R6C8", "R7C8"], ["R7C8", "R7C9"], ["R7C6", "R8C6"], ["R8C6", "R9C6"]];
// Purple arrowheads, ordered from larger digit to smaller digit.
const arrows = [["R2C8", "R3C8"], ["R7C7", "R7C8"], ["R9C9", "R9C8"], ["R9C3", "R9C2"]];
return [shape,
  ...gears.map(cells => new BlackDot(...cells)),
  ...arrows.map(cells => new GreaterThan(...cells)),
];
