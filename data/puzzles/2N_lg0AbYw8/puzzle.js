// Title: Foes Eternal
// Author: Panthera & theasylm
// Video: https://www.youtube.com/watch?v=2N_lg0AbYw8
// Source: https://sudokupad.app/ie3en5rp4i?setting-nogrid=1

// "Foes Eternal" is a pair of 9x9 grids that are solved together. Puzzle A is the
// main grid here; puzzle B is carried on a Var overlay, with its own row, column
// and box groups.
//
// Rules encoded:
//  - Normal Sudoku in both grids.
//  - Outside each row and column of each grid, coloured squares list, in order,
//    the runs of contiguous cells shaded that colour in that row/column. The
//    number in a square is the sum of the digits in its run. Two runs of the same
//    colour need at least one unshaded cell between them; runs of different
//    colours do not. All shaded runs are given. Puzzle A shades in red only;
//    puzzle B shades in six colours.
//  - A labelled cage sits inside one grid and on outside-clue squares of the
//    other. The digit in the in-grid cage is the number of every same-labelled
//    outside square in the other grid: A1-A4 live in puzzle A's grid and supply
//    puzzle B's unnumbered clues; B1-B4 live in puzzle B's grid and supply
//    puzzle A's unnumbered clues.
//  - One black Kropki dot in puzzle A: R2C8 and R2C9 are in a 1:2 ratio.
//
// Not encoded, being presentation rather than final-grid rules: the fog of war and
// its reveal behaviour, the FOGLIGHT cages that drive it, the advice to turn off
// the conflict checker and to erase unshaded pencil marks, and the note that
// puzzle B's completion check wants the transferred numbers typed into its
// outside squares.

const shape = new Shape('9x9');
const graph = cellGraph(shape);

// Puzzle B's digits, and one shading state per cell of each grid.
const gridB = graph.makeOverlay('VB');
const shadeA = graph.makeOverlay('VP');
const shadeB = graph.makeOverlay('VQ');

// Shading codes. 1 is unshaded in both grids; puzzle A only ever shades red.
const UNSHADED = 1;
const RED = 2;
const GRAY = 2, GREEN = 3, DARKBLUE = 4, LIGHTBLUE = 5, PINK = 6, YELLOW = 7;

// The cells of the labelled single-cell cages, in the grid that holds each label.
const TRANSFER = {
  A1: 'R8C9', A2: 'R9C7', A3: 'R8C8', A4: 'R5C8',
  B1: gridB.at('R4C7'), B2: gridB.at('R9C8'),
  B3: gridB.at('R9C4'), B4: gridB.at('R1C3'),
};

// Outside clues, transcribed from the coloured squares drawn outside each grid:
// one entry per square, row clues read left to right, column clues top to bottom.
// [colour, sum] for a numbered square; [colour, 'B2'] for an unnumbered square
// whose number is transferred from that label's cage in the other grid.
const A_ROW_CLUES = [
  [[RED, 7], [RED, 9]],
  [[RED, 'B2'], [RED, 14]],
  [[RED, 12], [RED, 10]],
  [[RED, 2], [RED, 16], [RED, 'B1']],
  [[RED, 4], [RED, 'B3'], [RED, 10]],
  [[RED, 'B3'], [RED, 36]],
  [[RED, 43]],
  [[RED, 'B2'], [RED, 6]],
  [[RED, 12], [RED, 12]],
];
const A_COL_CLUES = [
  [[RED, 5]],
  [[RED, 'B4'], [RED, 4]],
  [[RED, 'B2'], [RED, 4], [RED, 3]],
  [[RED, 6], [RED, 17], [RED, 10]],
  [[RED, 'B2'], [RED, 28], [RED, 5]],
  [[RED, 16]],
  [[RED, 6], [RED, 16], [RED, 2]],
  [[RED, 'B1'], [RED, 35]],
  [[RED, 41], [RED, 1]],
];
const B_ROW_CLUES = [
  [],
  [[YELLOW, 'A1'], [LIGHTBLUE, 7]],
  [[GRAY, 1], [PINK, 'A2'], [LIGHTBLUE, 8]],
  [[GRAY, 20], [PINK, 'A2'], [DARKBLUE, 23]],
  [[GRAY, 'A1'], [DARKBLUE, 'A1'], [PINK, 'A4']],
  [[DARKBLUE, 9], [LIGHTBLUE, 4]],
  [[GREEN, 8], [LIGHTBLUE, 22]],
  [[GREEN, 21], [DARKBLUE, 'A1'], [LIGHTBLUE, 5]],
  [[GREEN, 42], [DARKBLUE, 'A2']],
];
const B_COL_CLUES = [
  [[GRAY, 4], [GREEN, 'A3']],
  [[GRAY, 7], [GREEN, 15]],
  [[GRAY, 1], [GREEN, 15]],
  [[GRAY, 12], [GREEN, 'A3']],
  [[PINK, 'A2'], [GREEN, 15]],
  [[DARKBLUE, 9], [LIGHTBLUE, 7], [DARKBLUE, 'A1'], [GREEN, 'A4']],
  [[YELLOW, 'A1'], [PINK, 'A2'], [DARKBLUE, 15], [LIGHTBLUE, 8], [GREEN, 'A3']],
  [[LIGHTBLUE, 15], [DARKBLUE, 8], [LIGHTBLUE, 7]],
  [[DARKBLUE, 3], [PINK, 'A4'], [LIGHTBLUE, 9], [DARKBLUE, 'A2']],
];

// A line's state machine scans shade, digit, shade, digit, ... over the nine cells,
// so a cell's colour and the digit it contributes are read together.
//   j      runs started so far; the run in progress is run j - 1
//   inRun  whether the previous cell continued run j - 1
//   s      digit sum accumulated for whichever run is being summed
//   pend   null: the next symbol is a shade; 0 / 1: the next symbol is the digit
//          of an unshaded / shaded cell; 'cmp': the transferred clue cell;
//          'done': it has been read
// `sums[k]` is the sum to check for run k, or null to leave that run's sum to
// another machine. With `trackIdx >= 0` the machine instead carries run trackIdx's
// sum to a final segment holding the transferred clue cell and compares them
// there, which keeps the unknown value out of the state until it is needed.
function lineSpec(colours, sums, trackIdx) {
  const K = colours.length;
  const runOk = (st) => {
    const k = st.j - 1;
    return trackIdx >= 0 || sums[k] === null || st.s === sums[k];
  };
  return NFA.encodeSpec({
    startState: { j: 0, inRun: false, s: 0, pend: null },
    transition: (st, value) => {
      if (value === SEGMENT_BREAK) {
        if (st.pend !== null || st.j !== K) return undefined;
        return { j: st.j, inRun: st.inRun, s: st.s, pend: 'cmp' };
      }
      if (st.pend === 'cmp') {
        if (st.s !== value) return undefined;
        return { j: st.j, inRun: st.inRun, s: st.s, pend: 'done' };
      }
      if (st.pend === null) {
        if (value === UNSHADED) {
          if (st.inRun && !runOk(st)) return undefined;
          return { j: st.j, inRun: false, s: st.s, pend: 0 };
        }
        // A shaded cell of the run's own colour always continues it, which is what
        // makes two same-coloured runs need an unshaded cell between them.
        if (st.inRun && colours[st.j - 1] === value) {
          return { j: st.j, inRun: true, s: st.s, pend: 1 };
        }
        if (st.inRun && !runOk(st)) return undefined;
        if (st.j >= K || colours[st.j] !== value) return undefined;
        const k = st.j;
        return {
          j: k + 1,
          inRun: true,
          s: (trackIdx < 0 || k <= trackIdx) ? 0 : st.s,
          pend: 1,
        };
      }
      if (st.pend === 1) {
        const k = st.j - 1;
        let s = st.s;
        if (trackIdx < 0) {
          if (sums[k] !== null) {
            s += value;
            if (s > sums[k]) return undefined;
          }
        } else if (k === trackIdx) {
          s += value;
          if (s > 9) return undefined;  // a transferred clue is one digit
        }
        return { j: st.j, inRun: true, s, pend: null };
      }
      return { j: st.j, inRun: false, s: st.s, pend: null };
    },
    accept: (st) => (trackIdx >= 0
      ? st.pend === 'done'
      : st.pend === null && st.j === K && (!st.inRun || runOk(st))),
    // 18 line symbols, plus the break and the clue cell for a tracking machine.
    maxDepth: trackIdx >= 0 ? 20 : 18,
  }, shape, trackIdx >= 0 ? { multiSegment: true } : undefined);
}

function lineConstraints(name, clues, digitCells, shadeCells) {
  const colours = clues.map(([colour]) => colour);
  const sums = clues.map(([, value]) => (typeof value === 'number' ? value : null));
  const scan = digitCells.flatMap((cell, i) => [shadeCells[i], cell]);
  return [
    new NFA(lineSpec(colours, sums, -1), name, ...scan),
    ...clues.flatMap(([, value], k) => (typeof value === 'number' ? [] : [
      new NFA(lineSpec(colours, sums, k), `${name} ${value}`, scan, [TRANSFER[value]]),
    ])),
  ];
}

function gridLines(label, clueRows, clueCols, digits, shades) {
  return [
    ...clueRows.flatMap((clues, i) => lineConstraints(
      `${label} row ${i + 1}`, clues, digits(graph.row(i + 1)), shades(graph.row(i + 1)))),
    ...clueCols.flatMap((clues, i) => lineConstraints(
      `${label} col ${i + 1}`, clues, digits(graph.column(i + 1)), shades(graph.column(i + 1)))),
  ];
}

return [
  shape,
  gridB.toVar('puzzle B digits'),
  shadeA.toVar('puzzle A shading'),
  shadeB.toVar('puzzle B shading'),

  // Puzzle B is an ordinary Sudoku grid in its own right.
  ...graph.houses().map((cells) => new AllDifferent(...gridB.at(cells))),

  // Puzzle A shades red only; puzzle B shades in six colours.
  shadeA.makeReplicate(new Given(shadeA.at('R1C1'), UNSHADED, RED)),
  shadeB.makeReplicate(new Given(shadeB.at('R1C1'), UNSHADED,
    GRAY, GREEN, DARKBLUE, LIGHTBLUE, PINK, YELLOW)),

  ...gridLines('A', A_ROW_CLUES, A_COL_CLUES, (cells) => cells, (cells) => shadeA.at(cells)),
  ...gridLines('B', B_ROW_CLUES, B_COL_CLUES, (cells) => gridB.at(cells), (cells) => shadeB.at(cells)),

  new BlackDot('R2C8', 'R2C9'),
];
