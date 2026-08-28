// Title: Crypto Thermo Sandwich Sudoku
// Author: Kyle Chandler
// Video: https://www.youtube.com/watch?v=Es4xdVuWz88
// Source: https://cracking-the-cryptic.web.app/sudoku/Hqr64j8dQP

// Normal sudoku rules apply: rows, columns and 3x3 boxes hold 1-9 once each.
// Traditional thermometers: digits strictly increase from the bulb along
// each line (source lines #0-#9; #4 and #5 are drawn tip-first, with the
// bulb as their last waypoint, so their cell order below is reversed).
// Traditional sandwich sudoku clues outside the grid: the digits between the
// 1 and the 9 in that row/column sum to the printed value (source overlays
// #0-#17, one per outside lane).
//
// "Each letter is a different digit": every sandwich clue is printed as
// letters instead of digits, and four grid cells are themselves given as a
// letter instead of a digit (source cell pencilMarks: R1C7='M', R8C8='O',
// R9C4='M', R9C6='J'). Across the sandwich tokens (S,B,Y,J,N,A,I) and the
// grid-given letters (M,O) there are exactly 9 distinct letters, so each
// stands for one grid digit 1-9 (a bijection). A two-letter clue token is
// the two-digit number the letters spell, tens digit first, matching the
// printed left-to-right (row lanes) / top-to-bottom (column lanes) order;
// the same letter used twice ("SS", "BB", "II") reads as that digit
// repeated. "Zero" is printed literally where a sandwich clue's value is 0
// (source overlays #12, #13), since digit 0 has no assigned letter.
//
// Video description: "translate all thermo cells [afterwards] to reveal two
// hidden messages" is a post-solve flavour step (translating the solved
// thermo digits into letters via some cipher), not a rule about the grid
// itself, so it adds no constraint and is not encoded. Grid columns 10-11
// (payload regions 10-11, incl. the letter legend text in column 10) are
// off the sudoku board and are also not encoded.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// One off-grid Var per letter used anywhere in the puzzle (sandwich tokens
// plus the four in-grid letter givens). Each stands for one grid digit;
// AllDifferent over all 9 (each domain 1-9, matching the grid) forces them
// into a bijection with the 9 grid digits, which is exactly "each letter is
// a different digit".
const LETTERS = ['S', 'B', 'Y', 'J', 'N', 'A', 'I', 'M', 'O'];
const letterVars = LETTERS.map(L => new Var(L, `letter ${L}`));
const letterCell = L => 'V' + L;

// A sandwich clue's printed value is an arithmetic expression over letters
// whose own digits are solver-determined, but Sandwich needs a literal
// target. Disjoin over every concrete assignment of the letters involved
// (few: at most 2 distinct letters per clue) and pin a Given + a concrete
// Sandwich together in each branch -- this is the actual rule ("the clue
// equals whatever digit(s) the letter(s) represent"), not an approximation.
function letterSandwich(cells, terms) {
  // terms: [[letter, placeValue], ...], letters may repeat (e.g. "SS").
  const distinctLetters = [...new Set(terms.map(([L]) => L))];
  const coeff = L => terms
    .filter(([letter]) => letter === L)
    .reduce((sum, [, place]) => sum + place, 0);

  const branches = [];
  const assign = {};
  (function recurse(i) {
    if (i === distinctLetters.length) {
      const total = distinctLetters.reduce(
        (sum, L) => sum + coeff(L) * assign[L], 0);
      branches.push(new And([
        ...distinctLetters.map(L => new Given(letterCell(L), assign[L])),
        Sandwich.fromCells(total, cells, geometry),
      ]));
      return;
    }
    const L = distinctLetters[i];
    for (let v = 1; v <= 9; v++) {
      assign[L] = v;
      recurse(i + 1);
    }
  })(0);
  return new Or(branches);
}

// Row sandwich clues (source overlays #4,#14,#15,#16,#13,#9,#10,#11,#12;
// left-of-grid lanes for R1..R9).
const rowSandwiches = [
  letterSandwich(graph.row(1), [['S', 10], ['B', 1]]),  // "SB"
  letterSandwich(graph.row(2), [['J', 1]]),              // "J"
  letterSandwich(graph.row(3), [['J', 1]]),              // "J"
  letterSandwich(graph.row(4), [['N', 1]]),              // "N"
  Sandwich.fromCells(0, graph.row(5), geometry),         // "Zero"
  letterSandwich(graph.row(6), [['B', 10], ['A', 1]]),  // "BA"
  letterSandwich(graph.row(7), [['A', 1]]),              // "A"
  letterSandwich(graph.row(8), [['Y', 1]]),              // "Y"
  Sandwich.fromCells(0, graph.row(9), geometry),         // "Zero"
];

// Column sandwich clues (source overlays #0,#5,#6,#1,#3,#2,#7,#8,#17;
// top-of-grid lanes for C1..C9).
const colSandwiches = [
  letterSandwich(graph.column(1), [['S', 10], ['S', 1]]), // "SS"
  letterSandwich(graph.column(2), [['B', 10], ['Y', 1]]), // "BY"
  letterSandwich(graph.column(3), [['B', 10], ['B', 1]]), // "BB"
  letterSandwich(graph.column(4), [['S', 10], ['S', 1]]), // "SS"
  letterSandwich(graph.column(5), [['S', 1]]),             // "S"
  letterSandwich(graph.column(6), [['S', 10], ['S', 1]]), // "SS"
  letterSandwich(graph.column(7), [['B', 10], ['B', 1]]), // "BB"
  letterSandwich(graph.column(8), [['B', 10], ['B', 1]]), // "BB"
  letterSandwich(graph.column(9), [['I', 10], ['I', 1]]), // "II"
];

// Thermometers (source lines #0-#9), bulb cell first.
const thermos = [
  new Thermo('R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5'),
  new Thermo('R1C6', 'R2C5'),
  new Thermo('R2C7', 'R3C7'),
  new Thermo('R4C2', 'R4C3'),
  new Thermo('R5C8', 'R4C8'),  // line #4: bulb at R5C8, drawn tip-first
  new Thermo('R5C5', 'R5C4'),  // line #5: bulb at R5C5, drawn tip-first
  new Thermo('R6C1', 'R6C2'),
  new Thermo('R7C3', 'R6C2'),
  new Thermo('R8C4', 'R8C5', 'R8C6'),
  new Thermo('R8C7', 'R8C6'),
];

// Grid cells given as a letter instead of a digit (source pencilMarks).
const letterGivens = [
  new SameValues(2, 'R1C7', letterCell('M')),
  new SameValues(2, 'R8C8', letterCell('O')),
  new SameValues(2, 'R9C4', letterCell('M')),
  new SameValues(2, 'R9C6', letterCell('J')),
];

return [
  new Shape('9x9'),
  ...letterVars,
  new AllDifferent(...LETTERS.map(letterCell)),
  ...thermos,
  ...rowSandwiches,
  ...colSandwiches,
  ...letterGivens,
];
