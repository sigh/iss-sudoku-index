// Title: Classic Sudoku
// Author: Rimu Takamura
// Video: https://www.youtube.com/watch?v=V38qsL1cmFs
// Source: https://cracking-the-cryptic.web.app/sudoku/rqjdnrMB9j

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload draws no other geometry (no cages, lines, or arrows) and carries
// no rules text.
const givens=[['R1C4',4],['R1C5',9],['R2C3',8],['R2C5',2],['R2C9',4],['R3C2',6],['R3C4',5],['R3C8',7],['R4C2',5],['R4C3',4],['R4C7',6],['R6C3',9],['R6C7',5],['R6C8',8],['R7C2',3],['R7C6',2],['R7C8',9],['R8C1',5],['R8C5',8],['R8C7',3],['R9C5',7],['R9C6',3]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
