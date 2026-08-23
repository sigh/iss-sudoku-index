// Title: Skylines
// Author: Doug Jelen
// Video: https://www.youtube.com/watch?v=z5VlguImuqw
// Source: https://app.crackingthecryptic.com/sudoku/qD6FFRP88b

// Normal sudoku rules (default row/column/box all-different on Shape('9x9')).
// Grid digits are skyscraper heights. Every one of the 36 border positions
// (9 per side) carries a coloured badge -- 6 colours are used, in place of a
// printed digit -- giving the count of visible skyscrapers from that
// vantage point along that row/column (standard visibility: a cell is
// visible if taller than every cell already passed). Each colour is a fixed
// but unknown digit 1-9, the same digit at every badge of that colour;
// different colours are different digits (per the rules' "different colours
// represent different numbers consistently"). Colour->digit is not given
// anywhere in the payload; it is one of the puzzle's own deductions, so each
// colour becomes a Var cell whose value the solver determines, tied into
// each of that colour's clue lines. Six 1x1 cells inside the grid are also
// drawn in one of the six clue colours (five colours once, gold twice); each
// uses the same underlay styling as the outside badges, so a coloured grid
// cell is read as the same key: that cell's digit equals the colour's
// number. One colour (purple) has no such cell and is pinned purely by its
// (single) outside clue. A seventh in-grid cell is coloured to match the
// underlay border grey exactly (i.e. no colour), is not one of the six clue
// colours, and carries no rule.

const COLORS = ['green', 'blue', 'red', 'choc', 'gold', 'purple'];
const colorVars = new Var('C', 'clue colour values', COLORS.length);
const colorCell = name => colorVars.cell(COLORS.indexOf(name) + 1);

// side -> array index 1..9 -> colour name, transcribed from the drawn
// underlay badges.
const CLUES = {
  top:    [null, 'green', 'blue', 'blue', 'red', 'choc', 'blue', 'gold', 'purple', 'green'],
  bottom: [null, 'green', 'red', 'green', 'choc', 'green', 'gold', 'blue', 'blue', 'green'],
  left:   [null, 'blue', 'red', 'gold', 'blue', 'gold', 'blue', 'choc', 'green', 'green'],
  right:  [null, 'green', 'choc', 'red', 'green', 'blue', 'gold', 'green', 'blue', 'green'],
};

const col = c => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, c));
const row = r => Array.from({ length: 9 }, (_, i) => makeCellId(r, i + 1));

// Nearest-cell-first sightline for each side/index.
function sightline(side, idx) {
  if (side === 'top') return col(idx);                    // R1..R9
  if (side === 'bottom') return col(idx).slice().reverse(); // R9..R1
  if (side === 'left') return row(idx);                    // C1..C9
  if (side === 'right') return row(idx).slice().reverse();  // C9..C1
}

// visibleCountSpec: reads the colour's Var cell first (sets the unknown
// target digit), then the 9 sightline cells nearest-first, counting a cell
// as visible when it exceeds every earlier cell on the line. Accepts when
// the final count equals the target read from the first cell. Rejects
// (returns undefined) as soon as the count would exceed the target, per the
// NFA state-blowup guidance.
const visibleCountSpec = NFA.encodeSpec({
  startState: { phase: 0, target: 0, tallest: 0, count: 0 },
  transition: ({ phase, target, tallest, count }, value) => {
    if (phase === 0) return { phase: 1, target: value, tallest: 0, count: 0 };
    const visible = value > tallest ? 1 : 0;
    const newCount = count + visible;
    if (newCount > target) return undefined;
    return { phase: 1, target, tallest: Math.max(tallest, value), count: newCount };
  },
  accept: ({ phase, target, count }) => phase === 1 && count === target,
  maxDepth: 10, // colour cell + 9 sightline cells
}, 9);

const clueConstraints = Object.entries(CLUES).flatMap(([side, colors]) =>
  colors.flatMap((color, idx) => {
    if (!color) return [];
    return [new NFA(
      visibleCountSpec, `sky-${side}${idx}`,
      [colorCell(color), ...sightline(side, idx)])];
  }));

// Coloured cells inside the grid, each naming the digit for one colour's Var
// (gold has two, both pinning the same Var). Drawn as 1x1 underlays sharing
// the outside badges' colour set.
const markerCells = {
  green: ['R4C9'],
  blue: ['R6C1'],
  red: ['R3C1'],
  choc: ['R1C5'],
  gold: ['R6C9', 'R9C6'],
};
const markerConstraints = Object.entries(markerCells).flatMap(([color, cells]) =>
  cells.map(cell => new SameValues(2, cell, colorCell(color))));

return [
  new Shape('9x9'),
  colorVars,
  new AllDifferent(...colorVars.cells()),
  ...clueConstraints,
  ...markerConstraints,
];
