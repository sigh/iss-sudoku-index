// Title: Classic Sudoku
// Author: Thomas Snyder
// Video: https://www.youtube.com/watch?v=gqh32EDSNOE
// Source: https://cracking-the-cryptic.web.app/sudoku/nQRG3JH2Jr

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload draws no cages, lines, or other geometry beyond the givens.
const givens=[['R1C2',7],['R1C5',6],['R1C9',9],['R2C1',6],['R2C4',5],['R2C8',8],['R3C3',4],['R3C7',7],['R4C2',3],['R4C6',6],['R5C1',2],['R5C5',5],['R5C9',8],['R6C4',4],['R6C8',1],['R7C3',3],['R7C7',4],['R8C2',2],['R8C6',7],['R8C9',3],['R9C1',1],['R9C5',8],['R9C8',2]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
