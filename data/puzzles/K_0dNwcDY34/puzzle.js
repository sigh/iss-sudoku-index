// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=K_0dNwcDY34
// Source: https://sudokupad.app/NhTqdGBQLT

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R1C7',8],['R1C9',9],['R2C1',2],['R2C5',6],['R3C1',8],['R3C3',7],['R3C6',9],['R3C7',4],['R4C2',5],['R4C4',4],['R4C6',1],['R4C9',2],['R6C1',4],['R6C4',9],['R6C6',7],['R6C8',8],['R7C3',1],['R7C4',8],['R7C7',2],['R7C9',6],['R8C5',5],['R8C9',3],['R9C1',7],['R9C3',4]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
