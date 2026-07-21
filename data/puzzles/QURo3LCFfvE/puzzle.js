// Title: The Solver's Journey
// Author: Dogdayboy
// Video: https://www.youtube.com/watch?v=QURo3LCFfvE
// Source: https://sudokupad.app/u3e1puzryz

// Each row's part of the journey is represented by ten position variables.
// Values 1-9 are columns and 10 means that the journey has left the row. A
// successful route never needs to visit a cell twice, so nine moves suffice.

const STOP = 10;
const shape = new Shape('9x9', STOP);
const graph = cellGraph(shape);

const whispers = [
  ['R7C4', 'R8C3', 'R9C3', 'R9C2', 'R9C1', 'R8C2', 'R7C1', 'R6C2'],
  ['R8C5', 'R9C6', 'R8C6'],
  ['R8C7', 'R9C7', 'R9C8', 'R8C9'],
  ['R6C3', 'R5C3', 'R5C2', 'R6C1', 'R5C1', 'R4C2'],
  ['R3C4', 'R3C3', 'R3C2'],
];

const blackDots = [
  ['R7C2', 'R7C3'],
  ['R5C8', 'R6C8'],
];

const whiteDots = [
  ['R7C7', 'R8C7'],
  ['R5C6', 'R6C6'],
  ['R3C7', 'R4C7'],
];

const journeys = Array.from(
  { length: 9 },
  (_, row) => new Var(`J${String.fromCharCode(65 + row)}`,
    `row ${row + 1} journey`, 10));

// Before STOP, a successful route can be taken to be simple: removing a cycle
// preserves the continuation from the repeated cell. This canonical form also
// prevents duplicate journey witnesses for the same digit grid.
const simpleJourneyKey = Pair.fnToKey(
  (a, b) => (a === STOP && b === STOP) || a !== b,
  STOP);

function position(row, step) {
  return journeys[row - 1].cell(step + 1);
}

function gridCell(row, col) {
  return makeCellId(row, col);
}

// One transition either remains stopped, moves horizontally by the source
// digit, moves upward from a 9, or (in row 1) reaches the red endpoint R1C2.
function journeyTransition(row, step) {
  const here = position(row, step);
  const next = position(row, step + 1);
  const branches = [new And([
    new Given(here, STOP),
    new Given(next, STOP),
  ])];

  for (let from = 1; from <= 9; from++) {
    const source = gridCell(row, from);

    if (row === 1 && from === 2) {
      branches.push(new And([
        new Given(here, from),
        new Given(next, STOP),
      ]));
    } else if (row > 1) {
      branches.push(new And([
        new Given(here, from),
        new Given(source, 9),
        new Given(next, STOP),
        new Given(position(row - 1, 0), from),
      ]));
    }

    for (let to = 1; to <= 9; to++) {
      const distance = Math.abs(to - from);
      if (distance === 0 || distance === 9) continue;
      branches.push(new And([
        new Given(here, from),
        new Given(source, distance),
        new Given(next, to),
      ]));
    }
  }

  return new Or(branches);
}

const journeyRules = journeys.flatMap((_, row0) => {
  const row = row0 + 1;
  return Array.from(
    { length: 9 },
    (_, step) => journeyTransition(row, step));
});

return [
  shape,
  // Widening to value 10 is only for STOP; playable cells remain digits 1-9.
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  ...journeys,
  new Given(position(9, 0), 5),       // yellow start at R9C5
  new Given(position(1, 9), STOP),
  ...journeys.map(journey => new PairX(
    simpleJourneyKey, 'simple journey', ...journey.cells())),
  ...journeyRules,
  ...whispers.map(cells => new Whisper(5, ...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
];
