// Title: Untitled
// Author: Unknown
// Video: https://www.youtube.com/watch?v=sQ7GxJKRVMM
// Source: https://cracking-the-cryptic.web.app/sudoku/Gh9B3pdnfm

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload carries no rules text and no clues beyond the givens.
const givens=[['R1C3',5],['R1C8',1],['R2C3',3],['R2C7',2],['R2C8',9],['R3C2',4],['R3C5',6],['R3C9',8],['R4C1',5],['R4C2',7],['R4C6',4],['R5C2',9],['R6C4',2],['R6C6',8],['R6C8',5],['R7C2',6],['R7C3',9],['R7C5',7],['R8C7',7],['R8C8',4],['R9C2',3],['R9C4',9],['R9C7',6]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
