// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=sov7fEvxjCQ
// Source: https://cracking-the-cryptic.web.app/sudoku/pPJFLBJRjq

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload carries no rules text and draws no other clue geometry. The 10
// gold-filled underlay cells are decorative (a tribute shape per the video
// description) and carry no constraint semantics.
const givens=[['R1C1',9],['R1C2',7],['R1C4',2],['R1C5',1],['R1C9',5],['R2C9',7],['R3C2',5],['R3C3',6],['R3C8',3],['R4C1',3],['R4C4',7],['R4C7',1],['R4C8',5],['R5C4',8],['R5C6',2],['R5C8',6],['R6C3',9],['R6C6',3],['R6C7',4],['R6C8',7],['R6C9',8],['R7C2',1],['R7C8',8],['R8C1',2],['R8C2',3],['R8C3',4],['R8C4',6],['R8C6',5],['R8C8',9]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
