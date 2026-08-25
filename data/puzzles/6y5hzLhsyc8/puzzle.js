// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=6y5hzLhsyc8
// Source: https://sudokupad.app/pNNNL76RHb

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R1C5',3],['R2C4',2],['R2C6',7],['R3C2',2],['R3C3',8],['R3C7',7],['R3C8',3],['R4C2',9],['R4C8',1],['R5C1',6],['R5C4',9],['R5C6',1],['R5C9',3],['R6C1',5],['R6C9',4],['R7C1',7],['R7C9',5],['R8C2',1],['R8C4',6],['R8C5',8],['R8C6',9],['R8C8',2],['R9C3',9],['R9C4',4],['R9C6',5],['R9C7',1]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
