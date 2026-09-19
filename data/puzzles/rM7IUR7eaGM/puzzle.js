// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=rM7IUR7eaGM

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. No rules
// text is drawn or spoken beyond this -- the on-screen grid shows givens
// only, no cages/lines/other geometry -- so no other clue is encoded.
const givens=[['R1C1',7],['R1C3',5],['R1C7',1],['R1C9',9],['R2C1',2],['R2C7',4],['R3C2',1],['R3C6',6],['R3C8',5],['R4C2',9],['R4C4',7],['R4C6',4],['R5C3',7],['R5C5',8],['R5C7',3],['R6C4',5],['R6C6',9],['R6C8',8],['R7C2',5],['R7C4',8],['R7C8',4],['R8C3',2],['R8C9',1],['R9C1',3],['R9C3',9],['R9C7',8],['R9C9',5]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
