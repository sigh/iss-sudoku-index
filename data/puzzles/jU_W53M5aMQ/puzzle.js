// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=jU_W53M5aMQ
// Source: https://cracking-the-cryptic.web.app/sudoku/PMhgbbQRRb

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload carries no rules text and draws no cages, lines, or other
// geometry beyond the givens and the default 3x3 box regions.
const givens=[['R1C2',2],['R1C3',9],['R1C7',4],['R2C4',5],['R2C7',1],['R3C2',4],['R4C5',4],['R4C6',2],['R5C1',6],['R5C8',7],['R6C1',5],['R7C1',7],['R7C4',3],['R7C9',5],['R8C2',1],['R8C5',9],['R9C8',6]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
