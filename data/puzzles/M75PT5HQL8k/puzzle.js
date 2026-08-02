// Title: Parity Cave
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=M75PT5HQL8k
// Source: https://sudokupad.app/701zcuaz8b

// Normal Sudoku rules apply. A shade overlay records the two connected areas.
// In row N and standard box N, exactly the digits 1 through N are shaded;
// because each such house is a Sudoku set, the two shade-to-digit links below
// encode both the membership and the stated count. A completely single-shade
// 2x2 is explicitly allowed, so no local 2x2 shading restriction is added.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');

// A pair is shade then grid digit. The two legal pairs say whether the digit
// belongs to the initial digit set for this row or box number.
const shadeKey = limit => Pair.fnToKey(
  (shadeValue, digit) =>
    (shadeValue === SHADED && digit <= limit) ||
    (shadeValue === UNSHADED && digit > limit),
  9);
const shadePairs = (limit, cells) => cells.map(
  cell => new Pair(shadeKey(limit), `shade 1-${limit}`, shade.at(cell), cell));

const rowShading = graph.rows().flatMap(
  (row, index) => shadePairs(index + 1, row));
const boxShading = graph.boxes().flatMap(
  (box, index) => shadePairs(index + 1, box));

// These are the two red paths transcribed from the drawn line geometry.
const redLines = [
  ['R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8'],
  ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R4C4', 'R3C3', 'R2C2'],
];
const oppositeParity = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);
const redParity = redLines.map(
  cells => new Pair(oppositeParity, 'opposite parity', ...cells));

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  new Given('R7C5', 3),
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  ...rowShading,
  ...boxShading,
  ...redParity,
];
