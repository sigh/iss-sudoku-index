// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=_PDgklMapNE
// Source: https://sudokupad.app/6hMgTmbNnb

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R1C1',2],['R1C4',4],['R1C7',7],['R2C4',5],['R2C8',8],['R3C3',6],['R3C9',9],['R4C4',7],['R4C7',2],['R4C8',5],['R5C5',8],['R6C2',3],['R6C3',4],['R6C6',9],['R7C1',7],['R7C7',3],['R8C2',8],['R8C6',6],['R9C3',9],['R9C6',4],['R9C9',6]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
