// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=svedkpPvRWI
// Source: https://cracking-the-cryptic.web.app/sudoku/3gLbRPQ42d

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R1C7',7],['R2C6',1],['R2C8',8],['R3C1',3],['R3C5',2],['R3C9',4],['R4C2',9],['R4C6',2],['R4C8',6],['R5C3',5],['R5C7',8],['R6C2',8],['R6C4',7],['R6C8',5],['R7C1',2],['R7C5',7],['R7C9',3],['R8C2',6],['R8C4',5],['R9C3',3]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
