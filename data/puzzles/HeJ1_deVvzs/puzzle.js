// Title: Visiting The Actress
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=HeJ1_deVvzs
// Source: https://sudokupad.app/lwoj3vaj4e

// Standard 8x8 sudoku: 1-8 once per row, column, and 2x4 box (the default
// box tiling for an 8x8 grid). Cells a king's move apart cannot repeat a
// digit. A black dot between R2C4-R2C5 is a 1:2 ratio pair; a white dot
// between R7C4-R7C5 is a consecutive pair.
//
// Omitted: the puzzle's chess-game rule (Region Sum Lines on the
// odd-numbered half-moves, Renban lines on the even-numbered half-moves,
// each traced along one of the first 5 moves per side of a chess game
// reaching the diagrammed position). Each line's cells are defined only as
// "the path of one move in the one game reaching this position" -- deriving
// them is retrograde chess analysis (a move history from a final position),
// which ISS cannot pose at all: the grid model has no intermediate board
// state or legal-move transition to reason over. Not a decode gap (no
// amount of extra drawn data would supply a rule the source states only as
// a deduction).
return [
  new Shape('8x8'),
  new AntiKing(),
  new BlackDot('R2C4', 'R2C5'),
  new WhiteDot('R7C4', 'R7C5'),
];
