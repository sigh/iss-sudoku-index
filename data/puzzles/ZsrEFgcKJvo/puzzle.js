// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=ZsrEFgcKJvo
// Source: https://cracking-the-cryptic.web.app/sudoku/7FTq4BpLhf

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload carries no rules text and draws no cages, lines, or other
// geometry beyond the givens and standard 3x3 box regions.
const givens=[['R1C3',5],['R1C4',6],['R2C3',8],['R2C4',7],['R3C1',2],['R3C6',9],['R3C7',1],['R4C1',9],['R4C6',8],['R4C7',2],['R6C3',7],['R6C4',2],['R6C9',4],['R7C3',6],['R7C4',5],['R7C9',7],['R8C6',1],['R8C7',4],['R9C6',2],['R9C7',3]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
