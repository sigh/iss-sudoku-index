// Title: Aug 17, 2021: Position Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=Kv5MCvxY26k
// Source: https://tinyurl.com/r39yats5

// Normal sudoku. Each outside clue gives the position (1-3, counted from
// that side, starting at 1 nearest the grid edge) of the largest digit
// among the first three cells read in from that side. Since the three
// cells of one clue always lie in a single row or column, sudoku's
// all-different rule already rules out a tie for the max.
// Clue directions/lanes/values transcribed from the payload's `text`
// entries (positions R0/C0/C10/R10 mark the outside side; the other
// coordinate is the 1-9 row/column the clue belongs to; the printed digit
// is the position).

// Position-K-is-max scan: the first cell in each list is the clue's
// pointed-to position; each remaining cell (the other two of the window)
// must be strictly less than it. Same idiom as the Quad Max NFA
// (data/puzzles/4BA_LntMqbA.1/puzzle.js): state carries only the target's
// value once seen, then rejects any later value that isn't strictly less.
const positionMaxSpec = NFA.encodeSpec({
  startState: { phase: 'target' },
  transition: (state, value) => {
    if (state.phase === 'target') return { phase: 'rest', target: value };
    return value < state.target ? state : undefined;
  },
  accept: state => state.phase === 'rest',
}, 9);

// Each entry: the clue's 3-cell window, ordered [target, other, other]
// where `target` is the window cell at the clue's printed position.
const outsideClues = [
  // Top: column, first three cells reading down from row 1, position from row 1.
  { cells: ['R2C3', 'R1C3', 'R3C3'] }, // C3: 2
  { cells: ['R3C4', 'R1C4', 'R2C4'] }, // C4: 3
  { cells: ['R1C5', 'R2C5', 'R3C5'] }, // C5: 1
  { cells: ['R1C8', 'R2C8', 'R3C8'] }, // C8: 1
  { cells: ['R1C9', 'R2C9', 'R3C9'] }, // C9: 1

  // Left: row, first three cells reading right from column 1, position from column 1.
  { cells: ['R4C2', 'R4C1', 'R4C3'] }, // R4: 2
  { cells: ['R6C3', 'R6C1', 'R6C2'] }, // R6: 3
  { cells: ['R7C3', 'R7C1', 'R7C2'] }, // R7: 3

  // Right: row, first three cells reading left from column 9, position from column 9.
  { cells: ['R3C7', 'R3C9', 'R3C8'] }, // R3: 3
  { cells: ['R4C7', 'R4C9', 'R4C8'] }, // R4: 3
  { cells: ['R6C8', 'R6C9', 'R6C7'] }, // R6: 2

  // Bottom: column, first three cells reading up from row 9, position from row 9.
  { cells: ['R8C1', 'R9C1', 'R7C1'] }, // C1: 2
  { cells: ['R8C2', 'R9C2', 'R7C2'] }, // C2: 2
  { cells: ['R7C5', 'R9C5', 'R8C5'] }, // C5: 3
  { cells: ['R9C6', 'R8C6', 'R7C6'] }, // C6: 1
  { cells: ['R9C7', 'R8C7', 'R7C7'] }, // C7: 1
];

return [
  new Shape('9x9'),

  new Given('R1C2', 2),
  new Given('R1C8', 3),
  new Given('R2C1', 1),
  new Given('R2C9', 4),
  new Given('R3C4', 5),
  new Given('R3C6', 6),
  new Given('R4C3', 4),
  new Given('R4C7', 7),
  new Given('R5C5', 1),
  new Given('R6C3', 3),
  new Given('R6C7', 8),
  new Given('R7C4', 2),
  new Given('R7C6', 1),
  new Given('R8C1', 8),
  new Given('R8C9', 5),
  new Given('R9C2', 7),
  new Given('R9C8', 6),

  ...outsideClues.map(({ cells }, i) =>
    new NFA(positionMaxSpec, `position-max-${i}`, ...cells)),
];
