// Title: Lucky 7
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=Uy4BTfwvEvM
// Source: https://app.crackingthecryptic.com/sudoku/NHQNdgPTQ6

// Normal sudoku rules apply. Identical digits cannot be a chess knight's move
// apart. Digits along each purple (renban) line are a set of consecutive
// numbers in any order. Purple lines which are joined by grey connecting lines
// are also equal sum lines: the sum of the digits on a purple line within one
// 3x3 box must be the same as the sum of the digits on a connected purple line.
// Different joined lines may have different sums.

// Purple lines, transcribed from the drawn purple strokes. Every purple line
// lies entirely inside one 3x3 box, so "the sum within one 3x3 box" is its
// whole sum; each key names the box its line sits in.
// box2 is one T-shaped purple line: the row-1 run R1C4-R1C5-R1C6 and the
// column-5 run R1C5-R2C5-R3C5 are drawn in the same purple at the same
// thickness and meet at R1C5, forming a single continuous purple stroke, so
// its five cells are one renban set and one box sum.
const purpleLines = {
  box1: ['R1C3', 'R1C2', 'R2C2', 'R2C3'],
  box2: ['R1C6', 'R1C5', 'R1C4', 'R2C5', 'R3C5'],
  box3: ['R2C8', 'R2C7', 'R3C7', 'R3C8'],
  box4: ['R6C3', 'R5C3', 'R4C3'],
  box5: ['R5C5', 'R4C4'],
  box6: ['R5C7', 'R6C8'],
  box7a: ['R8C3', 'R7C2'],
  box7b: ['R9C1', 'R9C2', 'R9C3'],
  box8: ['R8C4', 'R8C5'],
  box9: ['R7C9', 'R8C8'],
};

// Grey connectors, transcribed from the drawn grey strokes, and the equal-sum
// groups they induce. Each connector runs between a cell of one purple line and
// a cell of another:
//   R7C9-R6C8 joins box9 to box6.
//   R4C4-R4C3 joins box5 to box4; R6C3-R7C2 joins box4 to box7a.
//   R8C4-R9C3 joins box8 to box7b.
//   R2C7-R1C6 joins box3 to box2; R1C4-R1C3 joins box2 to box1.
// Every purple line is touched by a grey connector, so all ten are summed.
const equalSumGroups = [
  ['box9', 'box6'],
  ['box5', 'box4', 'box7a'],
  ['box8', 'box7b'],
  ['box3', 'box2', 'box1'],
];

return [
  new Shape('9x9'),
  new Given('R9C9', 7),
  new AntiKnight(),
  ...Object.values(purpleLines).map(cells => new Renban(...cells)),
  ...equalSumGroups.map(
    group => new EqualSum(...group.map(key => purpleLines[key]))),
];
