// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=teOXgjSK7vA
// Source: https://app.crackingthecryptic.com/2G82fBgpHq

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R1C2',7],['R1C6',4],['R1C9',2],['R2C3',1],['R2C5',3],['R2C8',4],['R3C4',5],['R3C7',1],['R4C2',4],['R4C6',3],['R4C9',8],['R5C3',3],['R5C7',7],['R6C1',1],['R6C4',6],['R6C8',9],['R7C3',4],['R7C6',1],['R8C2',2],['R8C5',7],['R8C7',8],['R9C1',5],['R9C4',9],['R9C8',6]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
