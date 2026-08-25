// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=zDdZcce56rM
// Source: https://app.crackingthecryptic.com/pggF8DqRLJ

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R1C3',2],['R1C5',8],['R1C7',7],['R2C6',4],['R2C8',2],['R3C3',4],['R3C8',8],['R4C1',8],['R4C6',6],['R5C6',1],['R5C8',6],['R6C2',5],['R6C5',7],['R6C6',3],['R6C7',9],['R7C7',1],['R7C8',3],['R8C5',9],['R8C7',5],['R9C1',9],['R9C5',4]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
