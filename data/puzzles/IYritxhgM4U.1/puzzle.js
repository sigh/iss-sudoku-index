// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=IYritxhgM4U
// Source: https://cracking-the-cryptic.web.app/sudoku/7pMdMGNj36

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload carries no rules text and draws no cages, lines, or other
// geometry; its 9 regions are the default boxes, so no explicit Regions
// constraint is needed.
const givens=[['R1C3',9],['R1C4',2],['R1C8',8],['R2C2',7],['R2C6',9],['R2C9',1],['R3C1',1],['R3C5',5],['R3C7',7],['R4C1',6],['R4C4',8],['R4C8',2],['R5C3',1],['R5C5',3],['R5C7',6],['R6C2',5],['R6C6',6],['R6C9',4],['R7C3',4],['R7C5',7],['R7C9',3],['R8C1',3],['R8C4',9],['R8C8',5],['R9C2',2],['R9C6',8],['R9C7',4]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
