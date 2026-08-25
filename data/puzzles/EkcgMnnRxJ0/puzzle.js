// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=EkcgMnnRxJ0
// Source: https://app.crackingthecryptic.com/8DLD9gMmLR

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload's regions array is nine standard 3x3 boxes (the default), and the
// rules text names no other clue.
const givens=[['R1C5',9],['R1C9',6],['R2C1',4],['R2C6',5],['R3C2',7],['R3C9',8],['R4C6',6],['R4C8',4],['R5C2',9],['R5C8',5],['R6C2',2],['R6C4',8],['R7C1',9],['R7C8',1],['R8C4',2],['R8C9',7],['R9C1',5],['R9C5',8]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
