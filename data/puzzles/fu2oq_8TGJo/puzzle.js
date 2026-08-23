// Title: Sus Yin Yang
// Author: gdc
// Video: https://www.youtube.com/watch?v=fu2oq_8TGJo
// Source: https://sudokupad.app/f3xngr79fu

// Normal Sudoku applies. The shading is the YinYang constraint's YY cell
// group: every cell is shaded or unshaded, each shade is one orthogonally
// connected region, and no 2x2 block is monochromatic. A shaded cell's
// pseudo value is row + column; an unshaded cell's pseudo value is its
// digit. On each circled purple line, equally distant pseudo values sum to
// the centre's. Fog and the FOGLIGHT UI marker do not constrain the final grid.

const SHADED = 1;
const UNSHADED = 2;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('YY');

const zippers = [
  ['R8C9', 'R7C9', 'R7C8', 'R8C8', 'R9C8', 'R9C7', 'R9C6'],
  ['R8C7', 'R7C7', 'R6C7'],
  ['R8C6', 'R7C6', 'R6C6', 'R5C6', 'R5C7', 'R5C8', 'R6C8', 'R6C9', 'R5C9', 'R4C9', 'R4C8', 'R4C7', 'R3C7', 'R2C7', 'R1C7'],
  ['R7C5', 'R6C5', 'R6C4'],
  ['R3C6', 'R4C6', 'R4C5', 'R5C5', 'R5C4', 'R4C4', 'R3C4'],
  ['R2C3', 'R3C3', 'R4C3', 'R4C2', 'R4C1'],
  ['R8C1', 'R7C1', 'R7C2', 'R7C3', 'R6C3', 'R6C2', 'R6C1'],
  ['R9C3', 'R8C3', 'R8C2', 'R9C2', 'R9C1'],
  ['R3C1', 'R2C1', 'R2C2'],
  ['R1C4', 'R1C5', 'R2C5'],
];

function rowPlusColumn(cell) {
  const { row, col } = parseCellId(cell);
  return row + col;
}

// This NFA reads [left shade, left digit, centre shade, centre digit, right
// shade, right digit]. Its state stores the completed pseudo values until the
// last digit can check left + right = centre.
function pseudoZipperTriple(left, centre, right) {
  const constants = [rowPlusColumn(left), rowPlusColumn(centre),
    rowPlusColumn(right)];
  const machine = NFA.encodeSpec({
    startState: { phase: 'left-shade' },
    transition: (state, value) => {
      switch (state.phase) {
        case 'left-shade':
          return { phase: 'left-digit', shaded: value === SHADED };
        case 'left-digit':
          return { phase: 'centre-shade', left: state.shaded ? constants[0] : value };
        case 'centre-shade':
          return { phase: 'centre-digit', left: state.left, shaded: value === SHADED };
        case 'centre-digit':
          return {
            phase: 'right-shade',
            left: state.left,
            centre: state.shaded ? constants[1] : value,
          };
        case 'right-shade':
          return {
            phase: 'right-digit',
            left: state.left,
            centre: state.centre,
            shaded: value === SHADED,
          };
        case 'right-digit': {
          const rightValue = state.shaded ? constants[2] : value;
          return state.left + rightValue === state.centre ? { done: true } : undefined;
        }
        default:
          return undefined;
      }
    },
    accept: state => state.done === true,
  }, geometry.numValues);
  return new NFA(machine, 'pseudo-zipper',
    shade.at(left), left, shade.at(centre), centre, shade.at(right), right);
}

const pseudoZippers = zippers.flatMap(line => {
  const middle = (line.length - 1) / 2;
  return line.slice(0, middle).map((left, index) => pseudoZipperTriple(
    left, line[middle], line[line.length - 1 - index]));
});

return [
  new Shape('9x9'),
  new YinYang(),
  new Given('R6C9', 2),
  ...pseudoZippers,
];
