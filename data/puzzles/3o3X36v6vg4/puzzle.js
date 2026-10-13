// Title: Russian Dolls
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=3o3X36v6vg4
// Source: https://sudokupad.app/8nPBD7G8JG

// The board and exactly two smaller contiguous Latin squares form a nested
// chain. Knight moves forbid equal digits; drawn dots give consecutive/ratio
// relations. No box rule or negative dot rule is stated.
const shape = new Shape('8x8');
const squares = Array.from({length: 6}, (_, i) => i + 2).flatMap(size =>
  Array.from({length: 9 - size}, (_, r) => r + 1).flatMap(row =>
    Array.from({length: 9 - size}, (_, c) => ({
      size, row, col: c + 1,
      cells: Array.from({length: size}, (_, dr) =>
        Array.from({length: size}, (_, dc) => makeCellId(row + dr, c + 1 + dc))).flat(),
    }))));
const flags = new Var('S', 'smaller Latin square truth flags', '10x14');
// Row/column distinctness is inherited from the board. Thus an NxN window
// is Latin iff all its values are <= N. Each flag is 1 iff this is true,
// otherwise 2; the automaton remembers the flag and whether a value exceeds N.
const memberships = squares.map((square, i) => {
  const spec = NFA.encodeSpec({
    startState: {phase: 'flag', flag: null, exceeded: false},
    transition: ({phase, flag, exceeded}, value) => {
      if (phase === 'flag') return value <= 2
        ? {phase: 'digits', flag: value, exceeded: false} : undefined;
      if (flag === 1 && value > square.size) return undefined;
      return {phase: 'digits', flag, exceeded: exceeded || value > square.size};
    },
    accept: ({phase, flag, exceeded}) => phase === 'digits' &&
      ((flag === 1 && !exceeded) || (flag === 2 && exceeded)),
  }, shape);
  return new NFA(spec, `Latin square size ${square.size}`, [flags.cell(i + 1), ...square.cells]);
});
const contains = (outer, inner) => outer.size > inner.size &&
  outer.row <= inner.row && outer.col <= inner.col &&
  outer.row + outer.size >= inner.row + inner.size &&
  outer.col + outer.size >= inner.col + inner.size;
// Any two true windows must be nested. The 139 candidates are every window
// of sizes 2..7; the board is the third square, of size 8.
const notBoth = Pair.fnToKey((a, b) => a !== 1 || b !== 1, shape);
const pairGroups = new Map();
squares.forEach((a, i) => squares.slice(i + 1).forEach((b, j) => {
  if (contains(a, b) || contains(b, a)) return;
  const k = i + j + 1;
  const offset = `${Math.floor(k / 14) - Math.floor(i / 14)},${k % 14 - i % 14}`;
  if (!pairGroups.has(offset)) pairGroups.set(offset, []);
  pairGroups.get(offset).push([i, k]);
}));
// The auxiliary locator packs 139 flags into 10x14 slots. Grouping by
// translation offset lets Replicate express the forbidden pairs.
const locator = cellGraph('10x14').makeOverlay('VS');
const nesting = [...pairGroups.values()].map(pairs => {
  const [i, k] = pairs[0];
  const origin = flags.cell(i + 1);
  return new Replicate([new Pair(notBoth, 'not two nonnested squares',
    origin, flags.cell(k + 1))],
    Replicate.encodeTargetCells(pairs.map(([start]) => flags.cell(start + 1)), origin, locator),
    origin);
});
// Drawn white and black edge dots.
const whiteDots = [['R6C7', 'R6C8'], ['R8C4', 'R8C5']];
const blackDots = [['R4C1', 'R5C1'], ['R4C5', 'R5C5'],
  ['R1C4', 'R1C5'], ['R1C7', 'R1C8']];
return [shape, new NoBoxes(), new AntiKnight(), flags,
  new Given(flags.cell(140), 2),
  ...memberships, new ContainExact('1_1', ...flags.cells().slice(0, squares.length)), ...nesting,
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
