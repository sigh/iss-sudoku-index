// Title: Humidex
// Author: shady moon
// Video: https://www.youtube.com/watch?v=Yr5qqN1t_HI
// Source: https://sudokupad.app/jvfdr3d0ag

// Normal sudoku rules apply (rows, columns, boxes all 1-9).
// Columns 1, 5, 9 and rows 1, 5, 9 each carry an indexing rule: a digit in
// one of those columns/rows tells where the column/row's own index digit
// (1, 5, or 9 respectively) sits in that cell's row/column. Thermometers
// increase from the bulb (first-listed cell). The marked diagonal (R1C1 to
// R9C9) has no repeats.

// Indexing('C', ...cells): for each control cell, with its own column C and
// digit V, forces the cell at (control cell's row, V) to hold C. Passing all
// of columns 1, 5, 9 in one call covers all three column-indexing clauses,
// since each control cell supplies its own column number.
const columnIndexCells = [
  'R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1',
  'R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5',
  'R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9',
];

// Indexing('R', ...cells): symmetric to the above, using each control
// cell's own row number and forcing the cell at (V, control cell's column).
const rowIndexCells = [
  'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9',
  'R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9',
  'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9',
];

return [
  new Shape('9x9'),

  new Indexing(Indexing.COL_INDEXING, ...columnIndexCells),
  new Indexing(Indexing.ROW_INDEXING, ...rowIndexCells),

  new Thermo('R4C1', 'R3C2', 'R2C3'),
  new Thermo('R6C4', 'R5C5', 'R4C6'),
  new Thermo('R8C7', 'R7C8', 'R6C9'),

  // diagonal- (payload) is the '\' diagonal, R1C1-R9C9.
  new Diagonal(-1),
];
