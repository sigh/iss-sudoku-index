// Title: Diagonal Skyscraper Sudoku
// Author: Magnus Josefsson
// Video: https://www.youtube.com/watch?v=TyuWhH0AV8M
// Source: https://app.crackingthecryptic.com/sudoku/d7Bh693gth

// Normal sudoku: rows, columns, and boxes all-different (the default Shape
// groups). The diagonals below carry no all-different restriction of their
// own, so digits may repeat along them.
//
// Skyscraper diagonals: "Clues outside the grid show how many 'buildings'
// can be seen in the given direction ... Buildings hide equal or smaller
// ones." Fourteen diagonals carry a clue, each counting strict running
// maxima scanning from the badge's end of its diagonal inward: a cell
// counts only when its digit exceeds every digit already scanned on that
// diagonal, so an equal-or-shorter digit stays hidden. Cell lists below are
// each diagonal's full run, ordered from the clued end.
//
// Two badges each sit exactly one diagonal step outside two different
// diagonals' first cells (the badge position is arithmetically equidistant,
// not a stacked/ambiguous label): the "4" east of row 5 serves both R4C9
// (up-left) and R6C9 (down-left); the "4" west of row 5 serves both R6C1
// (down-right) and R4C1 (up-right). Both arrow objects are present in the
// payload independently, so both diagonals are encoded with that value.

// Builds one NFA spec for "exactly `target` strict running-maxima" over a
// single diagonal. State = the tallest digit scanned so far (0 = none) and
// the count of new-maximum cells so far, clamped at target+1 once the clue
// can only fail.
const skyscraperSpec = (target) => NFA.encodeSpec({
  startState: { max: 0, count: 0 },
  transition: ({ max, count }, value) => {
    const hit = value > max ? 1 : 0;
    return { max: Math.max(max, value), count: Math.min(count + hit, target + 1) };
  },
  accept: ({ count }) => count === target,
}, /* numValues= */ 9);

// One compiled spec per distinct clue value (2, 3, 4), reused across
// diagonals that share a target.
const specByTarget = {};
const skyscraperNFA = (target, ...cells) => {
  specByTarget[target] ??= skyscraperSpec(target);
  return new NFA(specByTarget[target], `Skyscraper${target}`, ...cells);
};

return [
  new Shape('9x9'),

  // Parity marks: "The square is an even digit, the circle an odd one" --
  // the only square/circle overlays in the payload, at R4C3 and R4C7.
  new Given('R4C3', 2, 4, 6, 8),
  new Given('R4C7', 1, 3, 5, 7, 9),

  // Diagonal skyscraper clues, cells ordered from the badge inward.
  skyscraperNFA(2, 'R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'),
  skyscraperNFA(2, 'R9C9', 'R8C8', 'R7C7', 'R6C6', 'R5C5', 'R4C4', 'R3C3', 'R2C2', 'R1C1'),
  skyscraperNFA(4, 'R1C4', 'R2C5', 'R3C6', 'R4C7', 'R5C8', 'R6C9'),
  skyscraperNFA(3, 'R1C6', 'R2C5', 'R3C4', 'R4C3', 'R5C2', 'R6C1'),
  skyscraperNFA(3, 'R2C9', 'R3C8', 'R4C7', 'R5C6', 'R6C5', 'R7C4', 'R8C3', 'R9C2'),
  skyscraperNFA(4, 'R4C9', 'R5C8', 'R6C7', 'R7C6', 'R8C5', 'R9C4'),
  skyscraperNFA(4, 'R4C9', 'R3C8', 'R2C7', 'R1C6'),
  skyscraperNFA(4, 'R6C9', 'R7C8', 'R8C7', 'R9C6'),
  skyscraperNFA(4, 'R9C6', 'R8C5', 'R7C4', 'R6C3', 'R5C2', 'R4C1'),
  skyscraperNFA(3, 'R9C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C9'),
  skyscraperNFA(3, 'R8C1', 'R7C2', 'R6C3', 'R5C4', 'R4C5', 'R3C6', 'R2C7', 'R1C8'),
  skyscraperNFA(4, 'R6C1', 'R5C2', 'R4C3', 'R3C4', 'R2C5', 'R1C6'),
  skyscraperNFA(4, 'R6C1', 'R7C2', 'R8C3', 'R9C4'),
  skyscraperNFA(4, 'R4C1', 'R3C2', 'R2C3', 'R1C4'),
];
