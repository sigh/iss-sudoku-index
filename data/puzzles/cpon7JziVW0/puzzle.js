// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=cpon7JziVW0
// Source: https://cracking-the-cryptic.web.app/sudoku/2NmTnBNND9

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R1C1',6],['R1C4',1],['R2C6',2],['R2C9',3],['R3C3',7],['R3C5',9],['R3C9',2],['R4C5',5],['R4C9',4],['R5C2',2],['R5C5',3],['R5C8',1],['R6C4',7],['R6C8',8],['R7C1',5],['R7C4',8],['R7C8',7],['R8C4',6],['R8C7',4],['R9C3',4],['R9C9',8]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
