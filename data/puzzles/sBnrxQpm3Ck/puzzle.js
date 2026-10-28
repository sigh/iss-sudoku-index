// Title: Darkness and Light (Yin-Yang)
// Author: David Workman (aka HalfBakedLunatic)
// Video: https://www.youtube.com/watch?v=sBnrxQpm3Ck
// Source: https://sudokupad.app/zvf2imrgu5

// Normal Sudoku, exhaustive Kropki dots, Yin-Yang shading, a minimum digit
// difference of 3 across shade boundaries, drawn walls across shade boundaries,
// and X sums of 10 with equal shades. X marks are not exhaustive.
const graph = cellGraph('9x9');
const shade = graph.makeOverlay('YY');
// Black-filled edge dots from the drawn grid.
const black = [["R7C3", "R8C3"], ["R4C1", "R4C2"], ["R2C3", "R3C3"], ["R5C5", "R6C5"], ["R3C3", "R3C4"], ["R1C1", "R2C1"], ["R1C4", "R2C4"], ["R1C9", "R2C9"], ["R5C1", "R5C2"], ["R6C6", "R7C6"], ["R6C6", "R6C7"], ["R6C8", "R7C8"], ["R7C8", "R7C9"], ["R8C1", "R8C2"]];
// White-filled edge dots from the drawn grid.
const white = [["R7C1", "R8C1"], ["R4C9", "R5C9"], ["R1C8", "R1C9"], ["R1C3", "R1C4"], ["R7C9", "R8C9"], ["R2C6", "R3C6"], ["R8C5", "R9C5"], ["R3C5", "R4C5"], ["R1C6", "R1C7"], ["R2C2", "R3C2"], ["R4C2", "R5C2"], ["R2C6", "R2C7"], ["R2C8", "R3C8"], ["R5C7", "R6C7"], ["R5C8", "R6C8"], ["R7C6", "R8C6"]];
// X edge marks from the drawn grid.
const xs = [["R1C5", "R2C5"], ["R8C9", "R9C9"], ["R9C2", "R9C3"], ["R6C5", "R6C6"]];
// Four heavy black border segments from the drawn grid.
const walls = [["R5C1", "R6C1"], ["R5C9", "R6C9"], ["R4C2", "R4C3"], ["R4C7", "R4C8"]];
const boundaries = graph.cells().flatMap(a =>
  graph.neighbours(a).filter(b => a < b).map(b =>
    new Or([new SameValues(2, ...shade.at([a, b])), new Whisper(3, a, b)])));
return [
  new Shape('9x9'),
  new YinYang(),
  // The rule treats the two colours symmetrically; fix the overlay's label swap.
  new Given(shade.at('R1C1'), 1),
  new StrictKropki(),
  ...black.map(pair => new BlackDot(...pair)),
  ...white.map(pair => new WhiteDot(...pair)),
  ...boundaries,
  ...walls.map(pair => new AllDifferent(...shade.at(pair))),
  ...xs.flatMap(pair => [new X(...pair), new SameValues(2, ...shade.at(pair))]),
];
