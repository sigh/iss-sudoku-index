// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=5VbH-oAzXDM
// Source: https://sudokupad.app/HBHpb2FFNB

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R1C2',7],['R1C3',8],['R1C9',1],['R2C3',2],['R2C4',1],['R2C7',6],['R2C9',4],['R3C4',6],['R3C8',8],['R4C2',5],['R5C1',7],['R5C3',4],['R5C4',3],['R5C9',8],['R6C8',9],['R6C9',7],['R7C1',3],['R7C4',5],['R8C9',2],['R9C2',1],['R9C5',3],['R9C6',4],['R9C7',5]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
