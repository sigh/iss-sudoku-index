// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=zPppoCiZ7wc
// Source: https://sudokupad.app/G2djRnp9tm

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R1C2',6],['R1C7',4],['R1C8',7],['R2C4',4],['R2C5',6],['R2C7',8],['R3C2',9],['R3C4',8],['R3C6',3],['R3C7',5],['R4C1',7],['R4C4',6],['R4C8',9],['R5C5',9],['R6C2',3],['R6C6',7],['R6C9',8],['R7C3',6],['R7C4',7],['R7C6',4],['R7C8',5],['R8C3',9],['R8C5',1],['R8C6',6],['R9C2',8],['R9C3',1],['R9C8',4]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
