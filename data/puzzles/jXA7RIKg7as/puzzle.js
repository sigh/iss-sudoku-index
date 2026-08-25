// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=jXA7RIKg7as
// Source: https://sudokupad.app/hMLRP7gqgf

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R1C5',5],['R1C9',1],['R2C2',6],['R2C4',1],['R2C6',9],['R2C9',4],['R3C1',3],['R3C2',1],['R3C8',2],['R4C5',8],['R4C6',1],['R5C2',9],['R5C3',3],['R5C7',2],['R5C8',1],['R6C4',2],['R6C5',4],['R7C2',3],['R7C8',6],['R7C9',2],['R8C1',9],['R8C4',6],['R8C6',7],['R8C8',5],['R9C1',2],['R9C5',9]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
