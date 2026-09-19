// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=BPMNu5-Pv24

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. No rules
// text is drawn or spoken beyond this -- the on-screen grid shows givens
// only, no cages/lines/other geometry -- so no other clue is encoded.
const givens=[['R1C1',7],['R1C2',5],['R1C5',1],['R2C3',4],['R2C5',9],['R2C6',5],['R2C8',6],['R3C4',8],['R3C6',7],['R4C1',4],['R4C6',3],['R4C9',7],['R5C2',2],['R5C8',1],['R6C1',6],['R6C4',5],['R6C5',2],['R6C9',3],['R7C4',4],['R7C6',6],['R8C2',7],['R8C4',9],['R8C5',5],['R8C7',4],['R9C8',2],['R9C9',6]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
