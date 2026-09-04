// Title: The New York Times Hard Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=UGDnLIFdSkg
// Source: https://cracking-the-cryptic.web.app/sudoku/M8t9QJNhTQ

// Standard Sudoku: rows, columns, and 3x3 boxes each contain 1-9 once. The
// archived payload carries no metadata, no rules text and no clue geometry
// (0 of 81 cells filled, default box regions only). A video frame at 0:52
// (external-video-frame-52s.jpg) shows the on-screen board with its givens
// and no rules panel, confirming a plain sudoku with no variant rule; the
// givens below are transcribed from that frame.
const givens=[['R1C1',5],['R1C2',3],['R1C4',7],['R2C6',4],['R2C8',5],['R2C9',2],['R3C7',7],['R4C1',6],['R4C2',8],['R4C6',9],['R5C2',7],['R5C5',5],['R5C6',2],['R5C8',3],['R7C1',9],['R7C3',3],['R7C4',6],['R7C9',4],['R8C3',6],['R9C4',8],['R9C7',9],['R9C9',1]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
