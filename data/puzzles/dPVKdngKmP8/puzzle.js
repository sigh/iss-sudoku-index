// Title: Can You Solve A "Grand Final" Sudoku?
// Author: Unknown
// Video: https://www.youtube.com/watch?v=dPVKdngKmP8

// Standard Sudoku: rows, columns, and 3x3 boxes each contain 1-9 once. No
// payload JSON or source URL exists for this row (0 puzzle_sources); the
// only evidence is two archived video frames (0:35, 1:30) showing the
// on-screen solving-software grid before any solving starts -- no rules
// panel, no cage totals, no lines, and the two frames match exactly cell
// for cell, confirming a pristine plain classic sudoku with no additional
// constraint. The 27 givens below are transcribed from that grid.
const givens=[['R2C2',3],['R2C3',9],['R2C4',8],['R2C8',6],['R3C2',6],['R3C3',1],['R3C4',9],['R3C9',3],['R4C2',1],['R4C3',6],['R4C6',9],['R4C8',5],['R5C5',7],['R5C6',8],['R5C7',9],['R6C4',2],['R6C5',1],['R6C7',4],['R7C5',9],['R7C6',7],['R7C7',6],['R7C9',4],['R8C2',7],['R8C4',4],['R9C3',4],['R9C7',5],['R9C9',2]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
