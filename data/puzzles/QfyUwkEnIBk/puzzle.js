// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=QfyUwkEnIBk
// Source: https://app.crackingthecryptic.com/QqMFNBt872

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R1C3',2],['R1C8',6],['R2C6',2],['R2C7',1],['R2C9',7],['R3C2',1],['R3C5',8],['R4C3',6],['R4C4',4],['R4C9',8],['R5C1',9],['R5C4',1],['R5C6',7],['R5C9',2],['R6C1',5],['R6C6',6],['R6C7',7],['R7C5',3],['R7C8',5],['R8C1',3],['R8C3',4],['R8C4',2],['R9C2',5],['R9C7',9]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
