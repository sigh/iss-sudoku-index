// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=2hL1S6U8aNc
// Source: https://cracking-the-cryptic.web.app/sudoku/39QjNnFFNm

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R1C1',8],['R1C4',7],['R1C5',9],['R2C2',2],['R2C3',7],['R2C6',1],['R3C2',4],['R3C3',9],['R3C4',5],['R3C5',2],['R4C1',9],['R4C3',5],['R4C4',4],['R4C8',7],['R5C1',2],['R5C3',6],['R5C7',4],['R5C9',8],['R6C2',8],['R6C6',7],['R6C7',1],['R6C9',9],['R7C5',7],['R7C6',8],['R7C7',6],['R7C8',2],['R8C4',6],['R8C7',8],['R8C8',1],['R9C5',4],['R9C6',2],['R9C9',7]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
