// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=WlXSAzRpIM4
// Source: https://sudokupad.app/nQtDb24Tpn

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload's regions array is nine standard 3x3 boxes (the default), and the
// rules text ("Normal sudoku rules apply") names no other clue.
const givens=[['R1C8',5],['R2C2',9],['R2C7',3],['R2C9',6],['R3C1',2],['R3C3',4],['R3C8',7],['R4C1',7],['R4C4',3],['R4C6',1],['R5C1',8],['R5C2',3],['R5C4',2],['R6C2',2],['R6C3',9],['R6C5',8],['R6C6',6],['R7C4',1],['R7C7',9],['R8C1',9],['R8C4',7],['R8C5',6],['R8C8',4],['R9C2',4],['R9C5',3],['R9C6',5],['R9C7',6]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
