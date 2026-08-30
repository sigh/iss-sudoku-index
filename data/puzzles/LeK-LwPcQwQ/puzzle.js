// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=LeK-LwPcQwQ
// Source: https://cracking-the-cryptic.web.app/sudoku/TTp6HT3jMf

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R1C1',3],['R1C5',5],['R1C9',8],['R2C2',9],['R2C5',7],['R2C7',5],['R3C4',8],['R3C6',4],['R3C7',1],['R4C2',2],['R4C4',7],['R5C1',5],['R5C5',2],['R5C6',8],['R5C9',4],['R6C1',7],['R6C7',6],['R7C2',6],['R7C7',8],['R8C3',2],['R8C7',9],['R8C9',1],['R9C2',1],['R9C4',9],['R9C6',5]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
