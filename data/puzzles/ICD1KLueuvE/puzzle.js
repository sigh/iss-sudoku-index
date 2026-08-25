// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=ICD1KLueuvE
// Source: https://sudokupad.app/Qgbpgm7bdM

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R1C1',1],['R1C5',3],['R1C7',6],['R1C9',9],['R2C1',5],['R2C3',2],['R2C8',3],['R3C4',6],['R4C5',4],['R4C7',8],['R5C1',3],['R5C2',7],['R5C5',2],['R5C9',6],['R6C3',6],['R6C5',1],['R6C6',7],['R7C4',4],['R8C2',8],['R8C7',9],['R8C9',2],['R9C1',7],['R9C3',5],['R9C5',9],['R9C9',1]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
