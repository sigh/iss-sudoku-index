// Title: Sum of the Shade
// Author: randall
// Video: https://www.youtube.com/watch?v=kLpazYijLas
// Source: https://sudokupad.app/54j9prbaax

// Normal 9x9 Sudoku. Yin-Yang: each shade is one orthogonally connected region,
// no 2x2 is monochrome, and each circle totals its touching shaded digits.

const SHADED = 1;
const UNSHADED = 2;
const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Every overlay cell is either shaded or unshaded.
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], SHADED, UNSHADED));

// A 2x2 reads four shade values; its state records the partial block and rejects
// the completed block only when all four values agree.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, 9);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no monochrome 2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

// Each circle's entries are [total, cells touching that drawn circle].
const circles = [
  [2, ['R1C5', 'R1C6']], [12, ['R5C9', 'R6C9']],
  [21, ['R1C8', 'R1C9', 'R2C8', 'R2C9']],
  [9, ['R8C8', 'R8C9', 'R9C8', 'R9C9']],
  [7, ['R1C1', 'R1C2', 'R2C1', 'R2C2']],
  [5, ['R8C1', 'R8C2', 'R9C1', 'R9C2']], [4, ['R9C3', 'R9C4']],
  [14, ['R4C1', 'R4C2', 'R5C1', 'R5C2']],
  [22, ['R7C2', 'R7C3', 'R8C2', 'R8C3']], [12, ['R4C7', 'R4C8']],
  [3, ['R5C7', 'R5C8', 'R6C7', 'R6C8']],
  [16, ['R6C7', 'R6C8', 'R7C7', 'R7C8']],
  [9, ['R2C7', 'R2C8', 'R3C7', 'R3C8']],
  [23, ['R2C4', 'R2C5', 'R3C4', 'R3C5']],
  [20, ['R4C5', 'R4C6', 'R5C5', 'R5C6']],
  [16, ['R7C4', 'R7C5', 'R8C4', 'R8C5']],
  [19, ['R8C5', 'R8C6', 'R9C5', 'R9C6']],
  [9, ['R7C8', 'R7C9', 'R8C8', 'R8C9']],
  [19, ['R3C8', 'R3C9', 'R4C8', 'R4C9']],
  [17, ['R5C2', 'R5C3', 'R6C2', 'R6C3']],
  [11, ['R2C2', 'R2C3', 'R3C2', 'R3C3']],
];

// Each NFA alternates a shade flag and its grid digit, accumulating only digits
// whose flag is SHADED. Segments keep the shade/digit pairing explicit.
function shadedSum(total, cells) {
  const machine = NFA.encodeSpec({
    startState: { sum: 0, shade: null },
    transition: ({ sum, shade: pendingShade }, value) => {
      if (value === SEGMENT_BREAK) return pendingShade === null
        ? { sum, shade: null } : undefined;
      if (pendingShade === null) return (value === SHADED || value === UNSHADED)
        ? { sum, shade: value } : undefined;
      return { sum: Math.min(sum + (pendingShade === SHADED ? value : 0), total + 1),
        shade: null };
    },
    accept: ({ sum, shade: pendingShade }) => pendingShade === null && sum === total,
  }, 9, { multiSegment: true });
  return new NFA(machine, `shaded sum ${total}`,
    ...cells.map(cell => [shade.at(cell), cell]));
}

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...circles.map(([total, cells]) => shadedSum(total, cells)),
];
