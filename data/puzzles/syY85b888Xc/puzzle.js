// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=syY85b888Xc
// Source: https://sudokupad.app/LFHbpFpN8r

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload's regions array is nine standard 3x3 boxes (the default), and the
// rules text ("Normal sudoku rules apply.") names no other clue.
const givens=[['R1C3',5],['R2C7',7],['R2C9',1],['R3C1',9],['R3C5',5],['R3C7',8],['R3C9',3],['R4C1',1],['R4C6',5],['R4C7',6],['R4C8',9],['R5C3',9],['R5C5',3],['R5C8',1],['R5C9',5],['R6C4',9],['R7C2',4],['R7C3',6],['R7C4',1],['R7C8',3],['R8C4',4],['R8C5',6],['R8C7',5],['R9C2',3],['R9C3',2],['R9C5',9]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
