// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=SSNB6jt4xBo
// Source: https://cracking-the-cryptic.web.app/sudoku/pFNTnPMDMp

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload carries no rules text and draws no cages, lines, or other
// geometry beyond the givens and the 9 standard box regions.
const givens=[['R1C3',1],['R1C4',2],['R1C7',3],['R1C8',4],['R1C9',5],['R2C8',6],['R3C2',7],['R3C3',6],['R3C6',5],['R3C7',2],['R5C1',6],['R5C2',3],['R5C3',4],['R5C5',8],['R6C2',9],['R6C3',8],['R6C4',1],['R6C8',3],['R7C3',3],['R7C6',2],['R8C6',1],['R8C7',4],['R9C2',2],['R9C3',7],['R9C5',9],['R9C6',4],['R9C7',5],['R9C9',3]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
