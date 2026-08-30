// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=xi-oNpouFnc
// Source: https://cracking-the-cryptic.web.app/sudoku/Jr846nGftm

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R1C3',1],['R1C5',2],['R1C6',7],['R1C8',3],['R2C4',9],['R2C9',4],['R3C1',2],['R3C7',5],['R4C3',4],['R4C8',7],['R5C3',3],['R5C5',8],['R5C7',9],['R6C2',8],['R6C7',4],['R7C3',7],['R7C9',6],['R8C1',5],['R8C6',3],['R9C2',4],['R9C4',6],['R9C5',1],['R9C7',8]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
