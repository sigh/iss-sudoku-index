// Title: I'm Desperately Seeking Barbie
// Author: Panthera
// Video: https://www.youtube.com/watch?v=f0Qo007k4Co
// Source: https://app.crackingthecryptic.com/sudoku/4mhJtngnF9

// Normal sudoku rules apply. Every cell is unshaded, shaded yellow, or shaded
// pink. Outside each row/column, stacked clues give the sum of each maximal
// same-colour run of shaded cells found in that row/column, in some fixed
// reading order shared by every clue stack; every run is given (no unlisted
// run may exist), and a same-colour run cannot border another same-colour run
// without an unshaded cell between them (automatic, since two touching
// same-colour cells are one run) but different-coloured runs may sit directly
// adjacent. The black dot (between R5C2/R6C2) is a Kropki ratio dot: one
// digit is double the other. The pink line (R6C3-R7C2) requires its two
// digits to be consecutive.

const UNSHADED = 1, YELLOW = 2, PINK = 3;

// One NFA scans a row/column as an interleaved [digit, colour, digit, colour,
// ...] list. State: `idx` is which outside clue is next to close; `cur` is
// the colour of a run currently open (UNSHADED means none open); `sum` is
// that run's running total; `pend` holds a just-read digit awaiting its
// paired colour symbol. A colour change closes the run in progress (checking
// it hit its clue's sum) and either opens the next expected run or returns to
// the unshaded baseline; continuing the same colour keeps accumulating `sum`.
function runSumSpec(clues) {
  return NFA.encodeSpec({
    startState: { phase: 'D', idx: 0, cur: UNSHADED, sum: 0, pend: 0 },
    transition: (state, value) => {
      const { phase, idx, cur, sum, pend } = state;
      if (phase === 'D') return { phase: 'C', idx, cur, sum, pend: value };
      if (value < 1 || value > 3) return undefined;
      let idx2 = idx, cur2 = cur, sum2 = sum;
      if (value !== cur) {
        if (cur !== UNSHADED) {
          const clue = clues[idx2];
          if (clue === undefined || clue.color !== cur || sum2 !== clue.sum) return undefined;
          idx2 += 1;
        }
        if (value === UNSHADED) {
          cur2 = UNSHADED;
          sum2 = 0;
        } else {
          const clue = clues[idx2];
          if (clue === undefined || clue.color !== value) return undefined;
          cur2 = value;
          sum2 = pend;
          if (sum2 > clue.sum) return undefined;
        }
      } else if (value !== UNSHADED) {
        sum2 = sum + pend;
        if (sum2 > clues[idx2].sum) return undefined;
      }
      return { phase: 'D', idx: idx2, cur: cur2, sum: sum2, pend: 0 };
    },
    accept: (state) => {
      const { phase, idx, cur, sum } = state;
      if (phase !== 'D') return false;
      if (cur === UNSHADED) return idx === clues.length;
      const clue = clues[idx];
      return clue !== undefined && clue.color === cur && sum === clue.sum && idx + 1 === clues.length;
    },
  }, 9);
}

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');

function interleave(digitCells, colorCells) {
  const out = [];
  for (let i = 0; i < digitCells.length; i++) out.push(digitCells[i], colorCells[i]);
  return out;
}

function rowNFA(n, clues) {
  return new NFA(runSumSpec(clues), `row${n}`, ...interleave(graph.row(n), shade.row(n)));
}
function colNFA(n, clues) {
  return new NFA(runSumSpec(clues), `col${n}`, ...interleave(graph.column(n), shade.column(n)));
}

// Drawn stacking order, nearest-the-grid entry first; colour taken from each
// clue overlay's own fill colour. Left lane per row, top lane per column.
const rowCluesNearFirst = {
  1: [{ color: YELLOW, sum: 9 }],
  2: [{ color: YELLOW, sum: 20 }],
  3: [{ color: YELLOW, sum: 4 }, { color: YELLOW, sum: 2 }, { color: YELLOW, sum: 13 }],
  4: [{ color: YELLOW, sum: 12 }, { color: YELLOW, sum: 14 }],
  5: [{ color: YELLOW, sum: 4 }, { color: YELLOW, sum: 6 }, { color: PINK, sum: 11 }, { color: YELLOW, sum: 3 }],
  6: [{ color: YELLOW, sum: 1 }, { color: YELLOW, sum: 2 }, { color: PINK, sum: 20 }],
  7: [{ color: YELLOW, sum: 5 }, { color: YELLOW, sum: 3 }, { color: PINK, sum: 23 }],
  8: [{ color: PINK, sum: 3 }],
  9: [{ color: PINK, sum: 20 }],
};
const colCluesNearFirst = {
  1: [{ color: YELLOW, sum: 3 }],
  2: [{ color: PINK, sum: 9 }, { color: PINK, sum: 18 }, { color: YELLOW, sum: 2 }],
  3: [{ color: PINK, sum: 21 }, { color: YELLOW, sum: 13 }],
  4: [{ color: PINK, sum: 7 }, { color: PINK, sum: 14 }, { color: YELLOW, sum: 11 }],
  5: [{ color: YELLOW, sum: 3 }, { color: PINK, sum: 8 }, { color: YELLOW, sum: 7 }],
  6: [{ color: YELLOW, sum: 7 }],
  7: [{ color: YELLOW, sum: 15 }, { color: YELLOW, sum: 11 }],
  8: [{ color: YELLOW, sum: 5 }, { color: YELLOW, sum: 10 }],
  9: [{ color: YELLOW, sum: 1 }, { color: YELLOW, sum: 10 }],
};

// The source draws each row/column's outside clues as a stack running away
// from the grid, but never says which end of that stack names the first run
// (SudokuPad-format puzzles leave this open in general; there is no further
// rules sentence or drawn feature here that picks one end). Both readings are
// encoded as alternatives, applied consistently to every lane at once (one
// fixed physical stacking order, not a per-lane choice).
function laneConstraints(nearFirst) {
  const order = clues => (nearFirst ? clues : [...clues].reverse());
  return [
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => rowNFA(n, order(rowCluesNearFirst[n]))),
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => colNFA(n, order(colCluesNearFirst[n]))),
  ];
}

return [
  new Shape('9x9'),
  shade.toVar('shading'),
  // Every shading cell holds one of the three colour codes.
  shade.makeReplicate(new Given(shade.cells()[0], UNSHADED, YELLOW, PINK)),
  new Or([
    new And(laneConstraints(true)),
    new And(laneConstraints(false)),
  ]),
  // Black dot, the edge mark between R5C2 and R6C2.
  new BlackDot('R5C2', 'R6C2'),
  // Pink line, R6C3-R7C2.
  new Renban('R6C3', 'R7C2'),
];
