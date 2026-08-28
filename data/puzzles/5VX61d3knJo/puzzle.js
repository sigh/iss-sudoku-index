// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=5VX61d3knJo
// Source: https://cracking-the-cryptic.web.app/sudoku/Q7QhR78LNf

// Rules, from the puzzle's original publication as "Krypto Sandwich Sudoku"
// by Realshaggy on Logic Masters Deutschland (id 00034U), which the video
// description names as the puzzle's source:
//
// - Normal sudoku: digits 1-9 once each in every row, column and 3x3 box.
//   The grid carries no givens.
// - Sandwich: a clue outside a row or column gives the sum of the digits
//   strictly between the cells holding the 1 and the 9 in that row/column.
// - The clues are not printed as numbers: the ten digits 0-9 have been
//   encrypted as the ten letters A-J. Equal letters are equal digits,
//   different letters different digits.
// - A clue of more than one digit does not begin with 0.
// - Some clue digits are printed as "?"; nothing further is known about them.
//
// A small letter is also drawn in each 3x3 box, as a corner mark in the box's
// middle cell: A, B, C across the top band of boxes, D, E, F across the
// middle band, G, H, I across the bottom band. Under the rules' own
// convention -- digits in this puzzle are written as letters -- a letter
// written in a cell is that cell's digit, so each of the nine marks fixes its
// cell to the digit its letter stands for. They are drawn as corner marks
// rather than as printed cell values because a printed value would lock the
// cell and leave the solver nowhere to write the digit, exactly as the ten
// letters of the key table below the grid are printed values over an empty
// row to write in. This also gives all ten letters a place: A-I appear in
// the grid, and J is the digit left over, which two of the clues use.

// The letters stand for 0-9, so the alphabet is widened by the single value 0
// to give the letter cells below a domain; the 81 playing cells are pinned
// back to ordinary sudoku digits.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const digitGivens = graph.makeReplicate(
  new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

// One cell per encrypted letter, holding the digit that letter stands for.
// Ten letters over the ten values 0-9, so AllDifferent makes the encryption a
// bijection: equal letters equal digits, different letters different digits.
const ALPHABET = 'ABCDEFGHIJ';
const letters = new Var('L', 'digit each letter A-J stands for', ALPHABET.length);
const letterCell = ch => letters.cell(ALPHABET.indexOf(ch) + 1);
const encryption = new AllDifferent(...letters.cells());

// Outside clues, transcribed lane by lane from the margin drawn around the
// grid: the strip above the grid carries the column clues, the strip left of
// it the row clues. Column 4 and row 7 carry no clue.
const CLUES = [
  ['column 1', graph.column(1), 'C'],
  ['column 2', graph.column(2), 'F?'],
  ['column 3', graph.column(3), 'J'],
  ['column 5', graph.column(5), 'EB'],
  ['column 6', graph.column(6), 'E?'],
  ['column 7', graph.column(7), 'FJ'],
  ['column 8', graph.column(8), 'FI'],
  ['column 9', graph.column(9), 'H'],
  ['row 1', graph.row(1), 'FE'],
  ['row 2', graph.row(2), 'H'],
  ['row 3', graph.row(3), 'E?'],
  ['row 4', graph.row(4), 'G'],
  ['row 5', graph.row(5), 'AE'],
  ['row 6', graph.row(6), 'C'],
  ['row 8', graph.row(8), 'F?'],
  ['row 9', graph.row(9), 'E?'],
];

// One machine per clue, over two segments.
//
// Segment 1 is the nine cells of the row/column in order. `before` is ahead of
// the first of the 1/9 pair, `inside` accumulates the digits strictly between
// them, `after` is past the second; a line that never reaches `after` is
// rejected at the segment break.
//
// Segment 2 is the clue's letter cells, most significant first. `tens` splits
// the accumulated total as 10*value + rest, rejecting value 0 (a clue of more
// than one digit does not begin with 0) and any rest outside 0-9; `ones` then
// requires the last letter to be exactly that rest. A clue whose printed units
// digit is "?" finishes at `tens`: every rest in 0-9 is a legal "?", and the
// "?" is given no cell because no other clue can refer to it.
//
// maxDepth is the exact input length, nine line cells plus the letter cells
// plus the one segment break; it bounds the running total, which is otherwise
// an unbounded state field.
const specs = new Map();
function clueSpec(twoDigits, unknownUnits, numLetterCells) {
  const key = `${twoDigits}-${unknownUnits}`;
  if (!specs.has(key)) specs.set(key, NFA.encodeSpec({
    startState: { phase: 'before', sum: 0 },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) {
        if (state.phase !== 'after') return undefined;
        return { phase: twoDigits ? 'tens' : 'ones', need: state.sum };
      }
      switch (state.phase) {
        case 'before':
          return (value === 1 || value === 9) ? { phase: 'inside', sum: 0 } : state;
        case 'inside':
          return (value === 1 || value === 9)
            ? { phase: 'after', sum: state.sum }
            : { phase: 'inside', sum: state.sum + value };
        case 'after':
          return state;
        case 'tens': {
          if (value === 0) return undefined;
          const rest = state.need - 10 * value;
          if (rest < 0 || rest > 9) return undefined;
          return unknownUnits ? { phase: 'done' } : { phase: 'ones', need: rest };
        }
        case 'ones':
          return value === state.need ? { phase: 'done' } : undefined;
        default:
          return undefined; // 'done': the clue is fully read.
      }
    },
    accept: state => state.phase === 'done',
    maxDepth: 9 + numLetterCells + 1,
  }, shape, { multiSegment: true }));
  return specs.get(key);
}

const sandwiches = CLUES.map(([name, lineCells, clue]) => {
  const symbols = clue.split('');
  const letterCells = symbols.filter(s => s !== '?').map(letterCell);
  const spec = clueSpec(symbols.length === 2, symbols[1] === '?', letterCells.length);
  return new NFA(spec, `sandwich ${name} = ${clue}`, lineCells, letterCells);
});

// The letter drawn in each box's middle cell, boxes in reading order. Each is
// one pair of equal single-cell sets: the grid cell holds that letter's digit.
// Nine distinct letters land on nine grid cells, so A-I take the nine digits
// 1-9 between them and J is left holding 0.
const keyCells = graph.boxes().map(box => box[4]);
const gridKey = keyCells.map((cell, i) =>
  new SameValues(2, cell, letterCell(ALPHABET[i])));

return [
  shape,
  digitGivens,
  letters,
  encryption,
  ...gridKey,
  ...sandwiches,
];
