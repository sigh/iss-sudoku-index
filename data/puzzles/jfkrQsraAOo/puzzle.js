// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=jfkrQsraAOo

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// puzzle's own app screenshot (external-video-frame-30s.jpg, pristine start)
// draws no cage, line, or other overlay, so no other clue is encoded.
const givens=[['R1C3',6],['R1C5',4],['R1C9',5],['R2C1',9],['R2C5',1],['R2C7',6],['R3C6',5],['R3C8',1],['R3C9',3],['R4C3',2],['R4C7',7],['R5C2',6],['R5C4',5],['R5C6',1],['R6C1',5],['R6C5',2],['R6C6',9],['R6C8',6],['R7C1',6],['R7C3',7],['R7C4',4],['R8C3',9],['R8C5',5],['R8C8',2],['R9C6',2]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
