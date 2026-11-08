// Title: Hidden German Whisper: Trinity
// Author: 72kchunshuai
// Video: https://www.youtube.com/watch?v=O2fpDl58HaM
// Source: https://sudokupad.app/h47xuwt40l

// Normal Sudoku, thermometers, renbans, region sum lines, and at least one
// hidden whisper of three or more cells in each connected line region.
// Fog is presentation. The drawn lines already satisfy the geometry restrictions.
// Grey strokes, ordered from their grey bulb discs.
const thermos = [
  "R2C3 R1C4 R1C5",
  "R2C3 R3C4 R3C5",
  "R2C1 R3C1 R4C2",
  "R1C2 R2C2 R3C3",
  "R1C2 R1C3",
  "R4C9 R4C8",
  "R8C2 R7C1 R6C2 R5C2 R4C2",
  "R6C8 R6C9"
].map(s => s.split(" "));
// Purple strokes.
const renbans = [
  "R2C6 R3C6 R4C6 R5C6 R6C6 R7C6 R8C6",
  "R6C5 R5C5 R5C4 R5C3 R4C3 R4C4 R4C5",
  "R8C8 R7C9 R7C8 R7C7",
  "R3C7 R4C7 R5C7 R5C8 R4C9"
].map(s => s.split(" "));
// Blue strokes in their drawn walk order.
const blueLines = [
  "R6C4 R7C5 R8C5 R9C5",
  "R9C2 R9C3 R9C4 R8C4 R7C4",
  "R7C7 R6C7 R6C8",
  "R4C8 R3C8 R3C9"
].map(s => s.split(" "));
// Connected unions of the drawn strokes, traversed from one endpoint to the other.
const lineRegions = [
  "R1C5 R1C4 R2C3 R3C4 R3C5",
  "R2C1 R3C1 R4C2 R5C2 R6C2 R7C1 R8C2",
  "R3C3 R2C2 R1C2 R1C3",
  "R3C7 R4C7 R5C7 R5C8 R4C9 R4C8 R3C8 R3C9",
  "R6C9 R6C8 R6C7 R7C7 R7C8 R7C9 R8C8",
  "R2C6 R3C6 R4C6 R5C6 R6C6 R7C6 R8C6",
  "R6C5 R5C5 R5C4 R5C3 R4C3 R4C4 R4C5",
  "R6C4 R7C5 R8C5 R9C5",
  "R9C2 R9C3 R9C4 R8C4 R7C4"
].map(s => s.split(" "));

// Every longer whisper contains a three-cell whisper. Conversely each such
// triple is itself an allowed hidden line; the disjunction leaves its position free.
const hiddenWhispers = lineRegions.map(path => new Or(
  path.slice(0, -2).map((_, i) => new Whisper(5, ...path.slice(i, i + 3)))
));
return [
  new Shape('9x9'),
  ...thermos.map(path => new Thermo(...path)),
  ...renbans.map(path => new Renban(...path)),
  ...blueLines.map(path => new RegionSumLine(...path)),
  ...hiddenWhispers,
];
