// Title: Learn To Solve This Beautiful New York Times Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=1Rh-ZsvxFQY
// Source: https://cracking-the-cryptic.web.app/sudoku/fRftpGmpdT

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload carries no rules text and draws no cages, lines, or other
// geometry beyond the givens and the standard 3x3 box regions.
const givens=[['R1C1',2],['R1C4',5],['R1C8',1],['R2C2',7],['R2C6',9],['R2C8',2],['R3C4',7],['R3C7',6],['R4C2',1],['R4C3',2],['R4C8',3],['R5C3',6],['R5C5',9],['R5C6',5],['R5C8',8],['R6C2',3],['R6C4',1],['R6C6',4],['R7C2',2],['R7C3',9],['R7C8',4],['R9C1',1],['R9C2',8],['R9C3',3],['R9C6',7]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
