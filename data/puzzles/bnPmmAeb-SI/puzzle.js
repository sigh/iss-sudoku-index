// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=bnPmmAeb-SI

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. No rules
// text is drawn or spoken beyond this -- the on-screen grid shows givens
// only, no cages/lines/other geometry -- so no other clue is encoded.
const givens=[['R1C2',9],['R1C6',4],['R1C8',8],['R1C9',5],['R2C2',1],['R2C5',8],['R2C7',9],['R3C3',2],['R3C4',3],['R3C5',9],['R3C8',4],['R4C6',9],['R4C9',8],['R5C1',5],['R5C5',3],['R5C8',9],['R5C9',6],['R6C1',9],['R6C4',8],['R7C2',4],['R7C6',8],['R7C7',2],['R8C3',3],['R8C5',4],['R8C8',1],['R9C1',6],['R9C4',7],['R9C6',3],['R9C8',5]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
