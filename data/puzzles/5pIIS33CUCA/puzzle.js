// Title: Classic Sudoku
// Author: TAKEI Daisuke
// Video: https://www.youtube.com/watch?v=5pIIS33CUCA

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. No rules
// text is drawn or spoken beyond this -- the on-screen grid shows givens
// only, no cages/lines/other geometry -- so no other clue is encoded.
const givens=[['R1C4',7],['R1C6',3],['R2C3',3],['R2C5',6],['R2C7',5],['R3C2',5],['R3C8',9],['R4C1',1],['R4C9',9],['R5C2',3],['R5C5',2],['R5C8',7],['R6C1',8],['R6C9',6],['R7C2',2],['R7C8',5],['R8C3',6],['R8C5',3],['R8C7',8],['R9C4',8],['R9C6',9]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
