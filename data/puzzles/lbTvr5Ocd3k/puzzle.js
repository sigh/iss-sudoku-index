// Title: Power Up!
// Author: TheAsylm
// Video: https://www.youtube.com/watch?v=lbTvr5Ocd3k
// Source: https://sudokupad.app/hMpJGmdHJ6

// Normal Sudoku rules apply. Normal Japanese Sums rules apply, with the colours
// Black and Red: each cell is left unshaded or shaded black or red; the clue
// squares outside a row or column list, in order, the contiguous runs of shaded
// cells of the clue's colour in that line, each clue giving the sum of its run's
// digits; runs of the same colour need at least one unshaded cell between them,
// runs of different colours do not; all runs are given.
//
// The "remove all unshaded marking once complete" sentence is presentation
// advice for the shading picture and constrains nothing.
//
// All 49 clue squares are encoded. Nothing is omitted.

const UNSHADED = 1;
const BLACK = 2;
const RED = 3;
const NO_RUN = 0;   // state value for "no run currently open"

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');

// Clue tables, transcribed from the exterior clue squares: grey squares are the
// Black clues and red squares are the Red clues. Row lists run left to right
// across the left margin, column lists run top to bottom down the upper margin,
// each clue list right/bottom-aligned against the grid in the usual Japanese
// Sums layout, so list order is line order.
const B = sum => ({ colour: BLACK, sum });
const R = sum => ({ colour: RED, sum });

const rowClues = [
  [B(28)],                            // R1
  [B(4), R(7), R(6), B(9)],           // R2
  [B(7), R(30), B(8)],                // R3
  [B(4), R(20), R(5), R(7), B(6)],    // R4
  [B(5), R(6), R(4), B(9)],           // R5
  [B(40)],                            // R6
  [B(7), B(5)],                       // R7
  [B(4), B(9)],                       // R8
  [B(18)],                            // R9
];

const columnClues = [
  [B(16)],                            // C1
  [B(4), R(8), B(9)],                 // C2
  [B(3), R(23), B(13)],               // C3
  [B(5), R(22), B(3), B(8)],          // C4
  [B(4), R(2), B(6), B(7)],           // C5
  [B(9), R(10), B(7), B(3)],          // C6
  [B(7), R(10), B(22)],               // C7
  [B(9), R(10), B(5)],                // C8
  [B(23)],                            // C9
];

// One machine per clued line. It scans the line as (shade, digit) pairs and
// tracks: which clue in the list the currently open run must satisfy (index),
// the colour of that open run (run), and the digits accumulated so far (sum).
//
// A run opens when the shade code changes to a colour, and closes when it
// changes to anything else; because runs are maximal, a same-colour run can
// only follow another after a shade code that is not that colour, and any
// intervening coloured run would need its own clue in the list. So the "at
// least one unshaded cell between runs of the same colour" clause needs no
// separate constraint. That clause is read as applying to consecutive runs:
// R3's clues total 7 + 30 + 8 = 45, the whole row, so R3 has no unshaded cell
// at all and a reading requiring one between its two Black runs would make the
// row unsatisfiable.
function japaneseSumMachine(clues) {
  return NFA.encodeSpec({
    startState: { phase: 'shade', index: 0, run: NO_RUN, sum: 0 },
    transition: (state, value) => {
      if (state.phase === 'digit') {
        if (state.run === NO_RUN) return { ...state, phase: 'shade' };
        const sum = state.sum + value;
        // Overshooting the open run's clue can never recover.
        if (sum > clues[state.index].sum) return undefined;
        return { ...state, phase: 'shade', sum };
      }
      const colour = value === UNSHADED ? NO_RUN : value;
      let { index, run, sum } = state;
      if (colour !== run) {
        if (run !== NO_RUN) {
          if (sum !== clues[index].sum) return undefined;
          index += 1;
        }
        if (colour !== NO_RUN
          && (index >= clues.length || clues[index].colour !== colour)) {
          return undefined;
        }
        run = colour;
        sum = 0;
      }
      return { phase: 'digit', index, run, sum };
    },
    accept: (state) => {
      if (state.phase !== 'shade') return false;
      // All runs are given, so the clue list must be exactly consumed.
      if (state.run === NO_RUN) return state.index === clues.length;
      return state.index === clues.length - 1
        && state.sum === clues[state.index].sum;
    },
    // Nine (shade, digit) pairs are the whole input for one line.
    maxDepth: 18,
  }, graph.gridGeometry().numValues);
}

const lines = [
  ...rowClues.map((clues, i) => [`row-${i + 1}`, graph.row(i + 1), clues]),
  ...columnClues.map((clues, i) => [`column-${i + 1}`, graph.column(i + 1), clues]),
];

const japaneseSums = lines.map(([name, cells, clues]) => new NFA(
  japaneseSumMachine(clues),
  name,
  ...cells.flatMap(cell => [shade.at(cell), cell]),
));

return [
  new Shape('9x9'),
  shade.toVar('shading'),
  shade.makeReplicate(new Given(shade.cells()[0], UNSHADED, BLACK, RED)),
  ...japaneseSums,
];
