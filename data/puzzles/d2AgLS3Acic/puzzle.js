// Title: German Whisper Pentominoes
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=d2AgLS3Acic
// Source: https://app.crackingthecryptic.com/sudoku/BmMjB4Dt62

// Normal sudoku rules apply: every row, column, and 3x3 box holds 1-9 once.
// "Orthogonally adjacent digits within a cage must differ by at least 5."
// The eight drawn cages carry no total, and the rules state no distinctness
// for them either, so that sentence is a cage's entire semantics here -- no
// AllDifferent is added (the catalog's "no-total cage = AllDifferent" default
// stands in only where the rules are silent on what a cage means; here they
// are not silent).
//
// Whisper() binds consecutive pairs by list order, not by grid adjacency, and
// four of the eight cages have an interior cell with three or four
// same-cage orthogonal neighbours (a branch), so no ordering of a cage's
// cells makes one Whisper line cover every adjacent pair. Each cage is
// instead expanded into one 2-cell Whisper(5, a, b) per orthogonally
// adjacent pair its cells actually contain.

function cageWhispers(cells) {
  const pairs = [];
  for (let i = 0; i < cells.length; i++) {
    const a = parseCellId(cells[i]);
    for (let j = i + 1; j < cells.length; j++) {
      const b = parseCellId(cells[j]);
      if (Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1) {
        pairs.push(new Whisper(5, cells[i], cells[j]));
      }
    }
  }
  return pairs;
}

// The eight pentomino cages, transcribed from the source's cage data
// (row-major cell order as drawn).
const cages = [
  ['R1C3', 'R1C2', 'R2C2', 'R3C2', 'R2C1'],
  ['R1C5', 'R2C5', 'R3C5', 'R2C6', 'R1C6'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C8', 'R3C8'],
  ['R5C1', 'R6C1', 'R6C2', 'R6C3', 'R5C3'],
  ['R6C7', 'R6C8', 'R6C9', 'R5C9', 'R4C9'],
  ['R7C3', 'R8C3', 'R8C2', 'R9C1', 'R9C2'],
  ['R7C5', 'R8C5', 'R9C5', 'R8C4', 'R8C6'],
  ['R7C7', 'R7C8', 'R8C8', 'R9C8', 'R9C9'],
];

const whispers = cages.flatMap(cageWhispers);

return [
  new Shape('9x9'),
  new Given('R5C8', 4),
  ...whispers,
];
