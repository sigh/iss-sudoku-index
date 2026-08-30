// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=YWwpfzjTJLk
// Source: https://cracking-the-cryptic.web.app/sudoku/nrbrB4HMdP

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload carries no rules text and draws no cages, lines, or other
// geometry beyond the givens and the standard box partition.
const givens=[['R1C4',2],['R1C8',1],['R2C4',9],['R2C7',4],['R2C9',2],['R3C2',9],['R3C6',7],['R4C2',4],['R4C3',3],['R4C6',6],['R4C7',5],['R5C1',5],['R5C5',9],['R5C9',6],['R6C1',8],['R6C4',7],['R7C1',1],['R7C3',5],['R7C7',3],['R8C6',1],['R8C8',9],['R9C2',2],['R9C4',3],['R9C8',8]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
