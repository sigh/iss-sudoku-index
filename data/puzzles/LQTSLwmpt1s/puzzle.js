// Title: Not the same
// Author: Thenonymous
// Video: https://www.youtube.com/watch?v=LQTSLwmpt1s
// Source: https://sudokupad.app/2jde6ar5zq

// Normal Sudoku, increasing thermometers, renbans, and anti-renbans.
const shape = new Shape("9x9");
// Grey bulb-to-tip paths.
const thermos = ["R2C8 R2C7 R1C7 R1C8 R1C9", "R9C2 R9C3 R8C3 R7C3 R7C2", "R1C1 R1C2 R1C3 R2C3 R2C2", "R8C8 R7C8 R7C7 R8C7 R9C7", "R4C4 R4C5 R4C6 R5C6"].map(line => new Thermo(...line.split(" ")));
// Magenta line paths.
const renbans = ["R6C3 R5C3 R4C3", "R6C8 R5C9 R4C8", "R5C4 R5C5 R5C6", "R8C6 R8C5 R9C4", "R3C6 R2C5 R2C4"].map(line => new Renban(...line.split(" ")));
// Hollow gold line cell sets; white inset strokes are the hollow styling.
const goldLines = ["R2C9 R3C9 R3C8 R3C7", "R1C1 R1C2 R1C3 R2C3", "R2C7 R1C7 R1C8 R1C9", "R7C3 R8C3 R9C3", "R7C7 R8C7 R9C7", "R2C1 R3C1 R3C2 R3C3", "R7C9 R8C9 R9C9 R9C8", "R6C6 R6C5 R6C4 R5C4", "R8C2 R9C1 R8C1 R7C1"];
// Every pair on a gold line must differ by at least two.
const goldKey = Pair.fnToKey((a, b) => Math.abs(a - b) > 1, shape);
const antiRenbans = goldLines.map(line => new PairX(goldKey, "anti-renban", ...line.split(" ")));
return [shape, ...thermos, ...renbans, ...antiRenbans];
