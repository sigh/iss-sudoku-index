// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=5ETetIDqIQo
// Source: https://sudokupad.app/4FJ8dPpnbh

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload's regions array is nine standard 3x3 boxes (the default), and the
// rules text ("Normal sudoku rules apply") names no other clue.
const givens=[['R1C1',4],['R1C4',8],['R1C8',6],['R2C5',7],['R2C8',4],['R2C9',2],['R3C4',9],['R3C7',5],['R4C2',3],['R4C6',6],['R4C7',8],['R6C1',6],['R6C3',2],['R6C4',4],['R6C6',8],['R6C8',3],['R7C1',3],['R7C2',4],['R7C7',6],['R8C3',7],['R8C9',5],['R9C2',5],['R9C5',2],['R9C8',7]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
