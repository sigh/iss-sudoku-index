// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=QXDrwCCj0oE
// Source: https://cracking-the-cryptic.web.app/sudoku/93TrqtdnT7

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload's regions array is nine standard 3x3 boxes (the default), carries
// no metadata.rules text, and names no other clue geometry.
const givens=[['R2C6',1],['R2C7',2],['R2C8',6],['R2C9',9],['R3C1',2],['R3C5',5],['R3C9',1],['R4C5',8],['R4C6',6],['R4C7',9],['R5C2',5],['R5C5',4],['R5C6',9],['R6C8',7],['R7C2',3],['R7C3',8],['R7C5',7],['R7C7',6],['R8C3',5],['R8C8',9],['R8C9',7],['R9C2',9],['R9C6',5],['R9C9',4]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
