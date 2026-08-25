// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=Bn6Kw8dFlHg
// Source: https://sudokupad.app/3Q6DTm8Md9

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload's regions array is nine standard 3x3 boxes (the default), and the
// rules text ("Normal sudoku rules apply.") names no other clue.
const givens=[['R1C5',7],['R2C4',4],['R2C6',3],['R3C2',3],['R3C3',8],['R3C7',9],['R3C8',1],['R4C4',3],['R4C6',5],['R5C2',6],['R5C8',2],['R6C2',9],['R6C3',3],['R6C7',4],['R6C8',5],['R7C4',2],['R7C6',4],['R8C1',1],['R8C3',7],['R8C7',2],['R8C9',4],['R9C1',2],['R9C2',4],['R9C8',6],['R9C9',1]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
