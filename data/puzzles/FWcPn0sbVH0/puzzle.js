// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=FWcPn0sbVH0
// Source: https://cracking-the-cryptic.web.app/sudoku/JDFGD8p2m3

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R1C1',8],['R1C7',3],['R2C2',4],['R2C6',1],['R3C1',2],['R3C4',4],['R3C5',7],['R4C1',4],['R5C2',1],['R5C6',2],['R5C8',7],['R6C3',3],['R6C5',9],['R6C9',5],['R7C4',6],['R7C5',8],['R7C6',5],['R8C3',8],['R8C7',1],['R8C8',2],['R9C6',9],['R9C9',3]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
