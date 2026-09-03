// Title: Web Design
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=o34FpUFGRKc
// Source: https://sudokupad.app/jaw9z4nws6

// Rules encoded below:
//   Normal sudoku.
//   WEB. A silky thread joins two white spots that are one or two cells apart
//   in a straight line -- horizontally, vertically or diagonally. Two threads
//   may not cross. The digit on a white spot is the number of threads attached
//   to it. The two spots a thread joins hold different digits.
//   INSECTS. A black insect between two digits: one is double the other. A
//   stripy green insect: the digits differ by at least 5. A spotty red insect:
//   one digit is odd and the other even.
//   CECIL. The digit Cecil the spider is thinking about is how many of those
//   insects have been caught on silky threads.
//
// "Cross" is read literally: two threads cross when their drawn segments share
// a point interior to both. That is the X-shaped intersection the word names,
// and it also rules out two collinear threads lying over one another. It
// leaves a thread free to pass over a white spot, and free to meet another
// thread at that thread's own end spot; the rules text speaks only of threads
// crossing, and "attach" is what ties a spot's digit to the threads that end
// on it.

// White spots: the 34 large white circles drawn on cell centres.
const WHITE_SPOTS = [
  'R1C1', 'R1C3', 'R1C5', 'R1C7', 'R1C9',
  'R2C4',
  'R3C1', 'R3C3', 'R3C4', 'R3C7',
  'R4C4', 'R4C6',
  'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C8',
  'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C9',
  'R7C1', 'R7C4', 'R7C5', 'R7C7', 'R7C8',
  'R8C2', 'R8C4', 'R8C6', 'R8C7',
  'R9C3', 'R9C5',
];

// Insects: each sits on the border between two orthogonally adjacent cells.
// Kind is the drawn body: plain black, stripy green, spotty red.
const INSECTS = [
  { kind: 'black', cells: ['R4C6', 'R5C6'] },
  { kind: 'black', cells: ['R5C5', 'R6C5'] },
  { kind: 'green', cells: ['R1C1', 'R1C2'] },
  { kind: 'green', cells: ['R1C5', 'R1C6'] },
  { kind: 'green', cells: ['R8C2', 'R8C3'] },
  { kind: 'green', cells: ['R8C5', 'R9C5'] },
  { kind: 'red', cells: ['R3C3', 'R3C4'] },
  { kind: 'red', cells: ['R4C4', 'R5C4'] },
  { kind: 'red', cells: ['R6C7', 'R7C7'] },
];

// Cecil is drawn just below the grid under column 7; his thought bubble rises
// to a cloud that sits wholly inside this cell.
const CECIL_CELL = 'R9C8';

const shape = new Shape('9x9');

// Doubled coordinates: cell (r, c) has centre (2r, 2c), so the midpoint of the
// border between two orthogonally adjacent cells is an integer point too, and
// every test below is exact integer arithmetic.
const centre = (id) => {
  const { row, col } = parseCellId(id);
  return [2 * row, 2 * col];
};
const sub = (p, q) => [p[0] - q[0], p[1] - q[1]];
const cross2 = (p, q) => p[0] * q[1] - p[1] * q[0];
const dot = (p, q) => p[0] * q[0] + p[1] * q[1];

// Candidate threads: one or two cells along a row, a column or a diagonal.
// Each direction is taken one way only, so every pair is generated once.
const DIRECTIONS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const spotSet = new Set(WHITE_SPOTS);
const threads = WHITE_SPOTS.flatMap((id) => {
  const { row, col } = parseCellId(id);
  return DIRECTIONS.flatMap(([dr, dc]) => [1, 2].map((k) => {
    const [r, c] = [row + dr * k, col + dc * k];
    if (r < 1 || r > 9 || c < 1 || c > 9) return null;
    const other = makeCellId(r, c);
    return spotSet.has(other) ? [id, other] : null;
  })).filter((t) => t !== null);
});

// Two threads share a point interior to both: a transversal crossing, or a
// collinear overlap of positive length.
const threadsCross = ([a1, b1], [a2, b2]) => {
  const p = centre(a1), r = sub(centre(b1), p);
  const q = centre(a2), s = sub(centre(b2), q);
  const qp = sub(q, p);
  const d = cross2(r, s);
  if (d === 0) {
    if (cross2(qp, r) !== 0) return false;
    // Collinear: measure the second segment along the first, in units of
    // dot(r, r), and ask whether the open intervals overlap.
    const t0 = dot(qp, r), t1 = t0 + dot(s, r);
    return Math.max(0, Math.min(t0, t1)) < Math.min(dot(r, r), Math.max(t0, t1));
  }
  const strictlyInside = (n) => (d > 0 ? n > 0 && n < d : n < 0 && n > d);
  return strictlyInside(cross2(qp, s)) && strictlyInside(cross2(qp, r));
};

// A point lies strictly between a thread's two end spots.
const onOpenThread = (pt, [a, b]) => {
  const p = centre(a), r = sub(centre(b), p), v = sub(pt, p);
  if (cross2(v, r) !== 0) return false;
  const t = dot(v, r);
  return t > 0 && t < dot(r, r);
};

// One cell per candidate thread, OFF when the thread is not built.
const [OFF, ON] = [1, 2];
const threadVar = new Var('T', 'thread', threads.length);
const threadCell = (i) => threadVar.cell(i + 1);

// Stamp the two-value domain onto every thread cell at once. The thread group
// is larger than the grid, so it has no grid overlay to build the Replicate
// from; a geometry that has been told about the group locates the cells.
const geometry = cellGeometry(shape);
geometry.addVarCellsForConstraints([threadVar]);
const threadDomains = new Replicate(
  [new Given(threadCell(0), OFF, ON)],
  Replicate.encodeTargetCells(threadVar.cells(), threadCell(0), geometry),
  threadCell(0));

const incident = new Map(WHITE_SPOTS.map((id) => [id, []]));
threads.forEach(([a, b], i) => { incident.get(a).push(i); incident.get(b).push(i); });

// Each incident thread cell contributes 1 when OFF and 2 when ON, so the
// incident cells total (count of incident threads) + (threads attached).
// Subtracting the spot's own digit and fixing the total at the incident count
// makes that digit the number of attached threads.
const spotDegrees = WHITE_SPOTS.map((id) => new Sum(
  incident.get(id).length,
  ...incident.get(id).map(threadCell),
  [id, -1]));

const notBothOn = Pair.fnToKey((a, b) => !(a === ON && b === ON), shape);
const noCrossings = threads.flatMap((t1, i) => threads.slice(i + 1)
  .map((t2, j) => [t2, i + 1 + j])
  .filter(([t2]) => threadsCross(t1, t2))
  .map(([, j]) => new Pair(notBothOn, 'no crossing', threadCell(i), threadCell(j))));

const differ = Pair.fnToKey((a, b) => a !== b, shape);
const endsDiffer = threads.map(([a, b], i) => new Or([
  new Given(threadCell(i), OFF),
  new Pair(differ, 'thread ends differ', a, b),
]));

const insectClues = INSECTS.map(({ kind, cells }) => {
  switch (kind) {
    case 'black': return new BlackDot(...cells);
    case 'green': return new Whisper(5, ...cells);
    case 'red': return new Modular(2, ...cells);
  }
});

// A thread catches an insect when it runs over the border midpoint the insect
// sits on. Two threads through the same midpoint would be collinear and
// overlapping, which the no-crossing rule already forbids, so each insect is
// caught at most once and the ON count over these cells is the number of
// insects caught.
const catchers = INSECTS.flatMap(({ cells }) => {
  const [a, b] = cells.map(centre);
  const pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  return threads.map((t, i) => i).filter((i) => onOpenThread(pt, threads[i]));
});
const cecilCount = new Sum(
  catchers.length, ...catchers.map(threadCell), [CECIL_CELL, -1]);

return [
  shape,
  threadVar,
  threadDomains,
  ...spotDegrees,
  ...noCrossings,
  ...endsDiffer,
  ...insectClues,
  cecilCount,
];
