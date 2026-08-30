// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=CL6iRqqXiqg
// Source: https://cracking-the-cryptic.web.app/sudoku/7PD6nQ77hT

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload carries no rules text and draws no cages, lines, or other
// geometry beyond the givens and the default 3x3 box regions.
const givens=[['R1C3',8],['R1C4',3],['R1C5',9],['R2C2',1],['R3C1',7],['R3C5',1],['R3C6',2],['R3C7',3],['R4C1',5],['R4C4',9],['R4C8',4],['R5C1',3],['R5C9',5],['R6C2',4],['R6C6',8],['R6C9',6],['R7C3',5],['R7C4',6],['R7C5',7],['R7C9',1],['R8C8',6],['R9C5',2],['R9C6',1],['R9C7',4]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
