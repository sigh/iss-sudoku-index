// Title: 4th Of July Sudoku Fireworks
// Author: Alexander Rappa
// Video: https://www.youtube.com/watch?v=usEfzFXthBo
// Source: https://cracking-the-cryptic.web.app/sudoku/4hNFmTLrFb
//
// Standard 9x9 sudoku (default boxes). Each unique letter of "FOURTH OF JULY"
// (F O U R T H J L Y - nine letters) stands for a unique digit 1-9. Twelve
// grid cells carry a letter instead of a digit, spelling the phrase; a letter
// used more than once (F, O, U) names the same digit each time.
// Thermometers: strictly increasing away from the bulb.
// Six outside clues give the classic "sandwich" sum (cells strictly between
// the 1 and the 9 in that row/column) but the printed clue is a letter (or,
// for one clue, two letters) instead of a number: the sandwich total equals
// the digit that letter represents, or for the two-letter clue the two-digit
// number with the first letter as tens digit and the second as units digit
// (rules text, "The two-letter sandwich clue...").
//
// Letter -> one representative grid cell holding that letter (repeats tied
// together below with SameValues). Read off the given letters spelling
// "FOURTH" across R2C2-R2C7, "OF" across R5C6-R5C7, and "J"/"U"/"L"/"Y" at
// R8C4, R9C5, R8C6, R9C7.
const letterCell = {
  F: 'R2C2', O: 'R2C3', U: 'R2C4', R: 'R2C5', T: 'R2C6', H: 'R2C7',
  J: 'R8C4', L: 'R8C6', Y: 'R9C7',
};

// Second occurrences of a repeated letter, tied to the representative above.
const repeatedLetterPairs = [
  ['F', 'R5C7'],
  ['O', 'R5C6'],
  ['U', 'R9C5'],
];

// Builds an NFA that reads a full row/column (9 cells) followed by 1 or 2
// "target" cells (SEGMENT_BREAK-separated), and accepts iff the sum of the
// cells strictly between the row/column's 1 and 9 equals the target: the
// single target cell's value (numTargetCells === 1), or
// 10*firstTargetCell + secondTargetCell (numTargetCells === 2), matching the
// tens/units reading the rules give the two-letter clue.
function sandwichEqualsTargetNfa(numTargetCells) {
  const spec = NFA.encodeSpec({
    startState: { phase: 'before', sum: 0, tens: null },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) {
        // The sandwich must already be closed (both 1 and 9 seen) by the end
        // of the row/column segment; test the break before any target-cell
        // branch below could mistake it for a value.
        if (state.phase !== 'after') return undefined;
        return { phase: 'target', sum: state.sum, tens: null };
      }
      if (state.phase === 'target') {
        if (numTargetCells === 1) {
          return value === state.sum ? { phase: 'done', sum: 0, tens: null } : undefined;
        }
        if (state.tens === null) {
          return { phase: 'target', sum: state.sum, tens: value };
        }
        const total = state.tens * 10 + value;
        return total === state.sum ? { phase: 'done', sum: 0, tens: null } : undefined;
      }
      // Still scanning the row/column itself.
      if (value === 1 || value === 9) {
        if (state.phase === 'before') return { phase: 'inside', sum: state.sum, tens: null };
        if (state.phase === 'inside') return { phase: 'after', sum: state.sum, tens: null };
        return undefined; // a third marker cannot occur in a valid grid
      }
      if (state.phase === 'inside') {
        return { phase: 'inside', sum: state.sum + value, tens: null };
      }
      return state; // before the first marker or after the second: not counted
    },
    accept: (state) => state.phase === 'done',
    // Bounds compile-time state exploration: 9 row/column cells + 1
    // SEGMENT_BREAK + numTargetCells target cells.
    maxDepth: 9 + 1 + numTargetCells,
  }, 9, { multiSegment: true });
  return spec;
}

const sandwichSpec1 = sandwichEqualsTargetNfa(1);
const sandwichSpec2 = sandwichEqualsTargetNfa(2);

function rowCells(r) {
  return Array.from({ length: 9 }, (_, c) => makeCellId(r, c + 1));
}
function colCells(c) {
  return Array.from({ length: 9 }, (_, r) => makeCellId(r + 1, c));
}

// Six outside clues, drawn as letters instead of numbers: row 6 = O,
// column 3 = F, column 5 = Y, column 7 = "UF" (two-digit, tens=U units=F),
// column 8 = F, column 9 = O.
const outsideClues = [
  new NFA(sandwichSpec1, 'sandwich row6 = O', rowCells(6), [letterCell.O]),
  new NFA(sandwichSpec1, 'sandwich col3 = F', colCells(3), [letterCell.F]),
  new NFA(sandwichSpec1, 'sandwich col5 = Y', colCells(5), [letterCell.Y]),
  new NFA(sandwichSpec2, 'sandwich col7 = UF', colCells(7), [letterCell.U, letterCell.F]),
  new NFA(sandwichSpec1, 'sandwich col8 = F', colCells(8), [letterCell.F]),
  new NFA(sandwichSpec1, 'sandwich col9 = O', colCells(9), [letterCell.O]),
];

return [
  new Shape('9x9'),

  // Every occurrence of the same letter holds the same digit.
  ...repeatedLetterPairs.map(([letter, cell]) =>
    new SameValues(2, letterCell[letter], cell)),
  // Different letters hold different digits (one representative cell per
  // letter is enough; SameValues above ties in the repeats).
  new AllDifferent(...Object.values(letterCell)),

  // Thermometers, strictly increasing from the bulb.
  new Thermo('R1C1', 'R2C1', 'R3C1', 'R3C2', 'R3C3', 'R2C3', 'R1C3'),
  new Thermo('R4C6', 'R4C5', 'R5C5', 'R5C6', 'R6C6', 'R6C5'),
  new Thermo('R8C7', 'R9C7'),
  new Thermo('R8C7', 'R8C8'),
  new Thermo('R8C7', 'R7C7', 'R7C8', 'R7C9', 'R8C9', 'R9C9'),

  ...outsideClues,
];
