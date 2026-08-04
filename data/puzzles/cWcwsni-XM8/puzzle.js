// Title: Eye of Agamotto
// Author: Allagem
// Video: https://www.youtube.com/watch?v=cWcwsni-XM8
// Source: https://app.crackingthecryptic.com/sudoku/pjdTmP6JRt

// Standard 9x9 sudoku (default row/column/box all-different from Shape).
// No givens; the payload's `cages` entries are all metadata stubs, not
// clues.
//
// Rule: "Adjacent digits along a green line must differ by at least 5."
// -> one Whisper(5, ...) per drawn green line (6 lines total; cell lists
// taken from the payload's line wayPoints).
//
// Rule: "A digit in column 1 indicates the column in which the digit 1
// appears in that row. Columns 5 and 9 have the same rule for the digits 5
// and 9 respectively." -> Indexing('C', ...cells): for each listed cell at
// (R, C) with value V, it forces cell (R, V) to hold value C+1 (C is the
// cell's own 0-indexed column). Passing every cell of column 1 makes C+1 = 1
// (the digit-1 rule); column 5 makes C+1 = 5; column 9 makes C+1 = 9 -- so
// one call per column reproduces all three stated sub-rules without
// re-deriving the target digit by hand. The 27 cells passed below are
// exactly the cells marked with a red circle underlay in the source.

const graph = cellGraph('9x9');

return [
  new Shape('9x9'),

  new Whisper(5, 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6'),
  new Whisper(5, 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'),
  new Whisper(5, 'R7C9', 'R6C9', 'R5C9', 'R4C9'),
  new Whisper(5, 'R6C1', 'R5C1', 'R4C1', 'R3C1'),
  new Whisper(5, 'R4C3', 'R3C4', 'R3C5', 'R4C6', 'R5C7'),
  new Whisper(5, 'R6C7', 'R7C6', 'R7C5', 'R6C4', 'R5C3'),

  new Indexing('C', ...graph.column('R1C1')),
  new Indexing('C', ...graph.column('R1C5')),
  new Indexing('C', ...graph.column('R1C9')),
];
