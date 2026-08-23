// Title: NO
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=2i4l7DtQFws
// Source: https://app.crackingthecryptic.com/sudoku/FD7DN3JFHq

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload's regions array is nine standard 3x3 boxes (the default), and the
// rules text names no other clue.
const givens=[['R1C4',1],['R1C5',2],['R1C6',3],['R2C3',2],['R2C7',4],['R3C2',1],['R3C4',4],['R3C8',5],['R4C1',2],['R4C3',5],['R4C5',7],['R4C9',6],['R5C1',3],['R5C4',8],['R5C5',4],['R5C6',2],['R5C9',7],['R6C1',4],['R6C5',6],['R6C7',9],['R6C9',8],['R7C2',5],['R7C6',6],['R7C8',9],['R8C3',6],['R8C7',8],['R9C4',7],['R9C5',8],['R9C6',9]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
