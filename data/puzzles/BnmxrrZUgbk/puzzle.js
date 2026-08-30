// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=BnmxrrZUgbk
// Source: https://cracking-the-cryptic.web.app/sudoku/dHFNqQLPjM

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R1C4',1],['R1C6',2],['R2C2',6],['R2C6',8],['R2C7',3],['R3C1',5],['R3C9',9],['R4C4',4],['R4C6',7],['R4C9',8],['R5C1',6],['R5C2',8],['R5C6',5],['R6C3',4],['R6C8',1],['R7C2',2],['R7C7',5],['R8C5',7],['R8C7',2],['R8C9',6],['R9C2',9],['R9C6',6],['R9C7',7]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
