// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=x-VdoVnAM80
// Source: https://cracking-the-cryptic.web.app/sudoku/L4q9gdgRn7

// Standard Sudoku: rows, columns and boxes each hold 1-9 once. The payload's
// regions array is the nine standard 3x3 boxes (the default).
//
// The source publishes no rules text at all -- no metadata object, no rules
// field, no title or author -- and the video description states no rule
// either. Four uniform light-grey (#CFCFCF, thickness 5) anti-diagonal
// strokes are drawn (R1C5-R5C1, R1C7-R7C1, R3C9-R9C3, R5C9-R9C5), carrying no
// bulb, arrowhead, circle, midpoint mark, fill, or colour/thickness variation
// that would name their rule family. Plain grey is the default stroke colour
// rather than a rule name, so the strokes are described but left unencoded
// rather than guessed. Only the givens below are encoded.
// Givens transcribed from the drawn grid, row by row.
const givens=[['R1C1',5],['R1C6',9],['R1C9',2],['R2C1',9],['R2C2',1],['R2C5',8],['R2C8',4],['R2C9',7],['R3C4',6],['R4C3',1],['R4C9',6],['R5C2',6],['R5C4',3],['R5C5',2],['R5C6',8],['R5C8',9],['R6C1',8],['R6C7',4],['R7C6',4],['R8C1',7],['R8C2',5],['R8C5',6],['R8C8',1],['R8C9',4],['R9C1',6],['R9C4',5],['R9C9',8]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
