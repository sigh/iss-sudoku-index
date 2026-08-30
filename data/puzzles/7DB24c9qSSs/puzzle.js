// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=7DB24c9qSSs
// Source: https://cracking-the-cryptic.web.app/sudoku/9MMRj2gbfj

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload carries no rules text and no geometry beyond regions/givens.
const givens=[['R1C4',9],['R2C6',4],['R2C7',1],['R3C1',9],['R3C5',6],['R3C6',1],['R3C9',5],['R4C5',1],['R4C7',5],['R5C3',1],['R5C5',5],['R5C6',8],['R5C9',2],['R6C1',6],['R6C2',3],['R7C2',2],['R7C4',8],['R8C3',8],['R8C5',7],['R8C8',5],['R8C9',1],['R9C7',3],['R9C9',9]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
