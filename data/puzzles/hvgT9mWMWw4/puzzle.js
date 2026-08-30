// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=hvgT9mWMWw4
// Source: https://cracking-the-cryptic.web.app/sudoku/6NJRNHBG6B

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R1C2',8],['R1C3',2],['R1C5',1],['R2C1',7],['R2C8',3],['R3C6',6],['R3C9',5],['R4C8',8],['R5C1',3],['R5C4',7],['R6C7',1],['R6C9',4],['R7C1',4],['R7C3',1],['R7C9',6],['R8C5',5],['R9C4',8]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
