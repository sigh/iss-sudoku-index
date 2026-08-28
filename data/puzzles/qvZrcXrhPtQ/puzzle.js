// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=qvZrcXrhPtQ
// Source: https://cracking-the-cryptic.web.app/sudoku/R4tMptr82G

// Rules, as published with the video:
//   Normal sudoku rules apply, and the marked diagonals each contain 1-9, as do
//   the blue cells. The Little Killer Clue shows the sum of the indicated
//   diagonal. Box 3 (red) is a Magic Square. All the rows, columns, and
//   diagonals sum to the same number. Box 5 (green) uses all the numbers 1-9 in
//   forming 2-digit Prime Numbers reading across (left-to-right) or down. Box 9
//   (purple) contains all the 2-digit Square Numbers reading across
//   (left-to-right) or down.
//
// Rows, columns and boxes come from the default Shape. Nothing is omitted.
//
// "Reading across (left-to-right) or down" gives, in a 3x3 box, the twelve
// two-digit numbers made from an orthogonally adjacent pair taken left-to-right
// or top-to-bottom -- see boxReadings below.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// The twelve two-digit readings of a 3x3 box, each as its [tens, ones] cells:
// six horizontal pairs read left-to-right, six vertical pairs read downwards.
const boxReadings = (topLeft) => {
  const cells = graph.block(topLeft, 3, 3);  // row-major
  const at = (r, c) => cells[r * 3 + c];
  const readings = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 2; c++) readings.push([at(r, c), at(r, c + 1)]);
  }
  for (let c = 0; c < 3; c++) {
    for (let r = 0; r < 2; r++) readings.push([at(r, c), at(r + 1, c)]);
  }
  return readings;
};

const isPrime = (n) => {
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return false;
  }
  return n > 1;
};

// Ordered relation: the first cell is the tens digit, the second the ones.
// Pair binds by array position, so the pair is directed as listed.
const primeReading = Pair.fnToKey((a, b) => isPrime(a * 10 + b), geometry);

const twoDigitSquares = [16, 25, 36, 49, 64, 81];

const magicSquare = (topLeft) => {
  const cells = graph.block(topLeft, 3, 3);
  const at = (r, c) => cells[r * 3 + c];
  const rows = [0, 1, 2].map(r => [at(r, 0), at(r, 1), at(r, 2)]);
  const columns = [0, 1, 2].map(c => [at(0, c), at(1, c), at(2, c)]);
  const diagonals = [
    [at(0, 0), at(1, 1), at(2, 2)],
    [at(0, 2), at(1, 1), at(2, 0)],
  ];
  return new EqualSum(...rows, ...columns, ...diagonals);
};

// The nine blue-shaded cells, transcribed from the blue square underlays.
const blueCells = [
  'R2C2', 'R2C5', 'R2C8',
  'R5C2', 'R5C5', 'R5C8',
  'R8C2', 'R8C5', 'R8C8',
];

return [
  new Shape('9x9'),

  // Givens, from the five filled cells.
  new Given('R2C1', 8),
  new Given('R3C1', 2),
  new Given('R3C2', 6),
  new Given('R8C1', 1),
  new Given('R8C2', 7),

  // The two grey corner-to-corner strokes.
  new Diagonal(1),
  new Diagonal(-1),

  // Nine cells holding 1-9 are nine different digits.
  new AllDifferent(...blueCells),

  // The "26" badge sits in the margin left of R4C1 with its arrow drawn towards
  // the lower right, so the diagonal it indicates enters the grid at R5C1.
  LittleKiller.fromCells(26, graph.ray('R5C1', 1, 1), geometry),

  // Box 3 (red).
  magicSquare('R1C7'),

  // Box 5 (green): every digit of the box takes part in at least one prime
  // reading. (Requiring all twelve readings to be prime is impossible: the ones
  // digit of a two-digit prime is 1, 3, 7 or 9, and the box's second and third
  // columns hold six cells that would all have to come from those four digits.)
  ...graph.block('R4C4', 3, 3).map(cell => new Or(
    boxReadings('R4C4')
      .filter(reading => reading.includes(cell))
      .map(([tens, ones]) => new Pair(primeReading, 'prime', tens, ones)))),

  // Box 9 (purple): each two-digit square is one of the box's twelve readings.
  ...twoDigitSquares.map(square => new Or(
    boxReadings('R7C7').map(([tens, ones]) => new And([
      new Given(tens, Math.floor(square / 10)),
      new Given(ones, square % 10),
    ])))),
];
