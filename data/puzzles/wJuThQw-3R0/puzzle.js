// Title: Diamond Sudoku
// Author: Bastien Vial-Jaime
// Video: https://www.youtube.com/watch?v=wJuThQw-3R0
// Source: https://cracking-the-cryptic.web.app/sudoku/rm6btddMTD

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload's regions array is nine standard 3x3 boxes (the default).
//
// The source publishes no rules text at all (empty rules string, no
// metadata.rules and no rules pseudo-cage), so only the givens below are
// encoded. A light-grey (#CFCFCF) closed diamond-shaped line is drawn across
// the middle of the grid (through R2C5-R3C4-R4C3-R5C2-R6C3-R7C4-R8C5-R7C6-
// R6C7-R5C8-R4C7-R3C6, back to R2C5) with no stated meaning and no visual
// marking (bulb, arrowhead, fill) that would identify its rule type, so it
// is omitted here rather than guessed.
const givens=[['R1C2',9],['R1C5',6],['R1C7',7],['R2C2',7],['R2C8',3],['R2C9',4],['R3C1',1],['R4C5',4],['R5C1',4],['R5C3',6],['R5C7',8],['R5C9',2],['R6C5',8],['R7C9',3],['R8C1',2],['R8C2',1],['R8C8',5],['R9C3',5],['R9C5',2],['R9C8',9]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
