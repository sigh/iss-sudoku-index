// Title: Mistyped
// Author: Gabriel Kammer
// Video: https://www.youtube.com/watch?v=Z30hHxCO7cA
// Source: https://sudokupad.app/9mqofo6f7g

// Normal sudoku. Color exactly 9 cells, one per row, column, and box. Each
// outside clue gives the sum of the digits before the colored cell reading
// inward along its row or column (colored cell excluded); the top-left clue
// reads the main diagonal from R1C1 and sums before the first colored cell
// (the whole diagonal if none is colored). Exactly 4 of the outside clues
// are typographical errors and are incorrect.

const graph = cellGraph("9x9");
const color = graph.makeOverlay("VCL");
const indices = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const row = (r) => graph.row(r);
const col = (c) => graph.column(c);

const lineClues = [
  { name: "L1", total: 28, cells: row(1) },
  { name: "L2", total: 18, cells: row(2) },
  { name: "L3", total: 4, cells: row(3) },
  { name: "L4", total: 28, cells: row(4) },
  { name: "L5", total: 44, cells: row(5) },
  { name: "L6", total: 0, cells: row(6) },
  { name: "L7", total: 7, cells: row(7) },
  { name: "L8", total: 34, cells: row(8) },
  { name: "L9", total: 10, cells: row(9) },

  { name: "B1", total: 22, cells: col(1).reverse() },
  { name: "B2", total: 14, cells: col(2).reverse() },
  { name: "B3", total: 17, cells: col(3).reverse() },
  { name: "B4", total: 0, cells: col(4).reverse() },
  { name: "B5", total: 38, cells: col(5).reverse() },
  { name: "B6", total: 18, cells: col(6).reverse() },
  { name: "B7", total: 37, cells: col(7).reverse() },
  { name: "B8", total: 7, cells: col(8).reverse() },
  { name: "B9", total: 21, cells: col(9).reverse() },

  { name: "R1", total: 9, cells: row(1).reverse() },
  { name: "R2", total: 21, cells: row(2).reverse() },
  { name: "R3", total: 36, cells: row(3).reverse() },
  { name: "R4", total: 15, cells: row(4).reverse() },
  { name: "R5", total: 0, cells: row(5).reverse() },
  { name: "R6", total: 36, cells: row(6).reverse() },
  { name: "R7", total: 37, cells: row(7).reverse() },
  { name: "R8", total: 6, cells: row(8).reverse() },
  { name: "R9", total: 31, cells: row(9).reverse() },

  { name: "T1", total: 14, cells: col(1) },
  { name: "T2", total: 30, cells: col(2) },
  { name: "T3", total: 24, cells: col(3) },
  { name: "T4", total: 41, cells: col(4) },
  { name: "T5", total: 1, cells: col(5) },
  { name: "T6", total: 24, cells: col(6) },
  { name: "T7", total: 0, cells: col(7) },
  { name: "T8", total: 31, cells: col(8) },
  { name: "T9", total: 23, cells: col(9) },

  {
    name: "D",
    total: 29,
    cells: indices.map(i => makeCellId(i, i)),
  },
];

const clueMachine = (total) => NFA.encodeSpec({
  startState: { error: null, phase: "color", sum: 0, stopped: false, include: false },
  transition: (state, value) => {
    if (state.error === null) {
      if (value !== 1 && value !== 2) return undefined;
      return { ...state, error: value };
    }

    if (state.phase === "color") {
      if (value !== 1 && value !== 2) return undefined;
      if (state.stopped || value === 1) {
        return { ...state, phase: "digit", include: false, stopped: true };
      }
      return { ...state, phase: "digit", include: true };
    }

    if (!state.include) {
      return { ...state, phase: "color" };
    }
    const sum = state.sum + value;
    if (sum > 45) return undefined;
    return {
      ...state,
      phase: "color",
      sum,
    };
  },
  accept: ({ error, phase, sum }) => {
    if (error === null || phase !== "color") return false;
    return error === 1 ? sum === total : sum !== total;
  },
}, 9);

const interleaveDigitAndColor = (cells) => (
  cells.flatMap(cell => [color.at(cell), cell])
);

const typoVar = new Var("E", "Typo", lineClues.length);
const errorCells = typoVar.cells();

return [
  new Shape("9x9"),
  color.toVar("Color"),
  typoVar,

  ...indices.map(r => row(r)).map(cells =>
    new ContainExact("1", ...color.at(cells))),
  ...indices.map(c => col(c)).map(cells =>
    new ContainExact("1", ...color.at(cells))),
  ...graph.boxes().map(cells =>
    new ContainExact("1", ...color.at(cells))),

  new ContainExact(Array(33).fill(1).join("_"), ...errorCells),

  ...lineClues.map(({ name, total, cells }, i) =>
    new NFA(
      clueMachine(total),
      `Clue-${name}`,
      errorCells[i],
      ...interleaveDigitAndColor(cells))),
];
