// Title: Classic Swirl
// Author: Matthias Frank
// Video: https://www.youtube.com/watch?v=ydbYIEGEEJ4
// Source: https://app.crackingthecryptic.com/sudoku/mTPrqGJ6pJ

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R1C1',8],['R1C2',9],['R1C6',7],['R1C8',1],['R2C5',9],['R2C9',5],['R3C3',1],['R3C8',4],['R4C2',3],['R4C4',2],['R4C6',5],['R5C3',6],['R5C7',4],['R6C4',9],['R6C6',8],['R6C8',2],['R7C2',2],['R7C7',1],['R8C1',5],['R8C5',7],['R9C2',8],['R9C4',3],['R9C8',6],['R9C9',7]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
