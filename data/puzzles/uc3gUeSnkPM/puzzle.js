// Title: Pokerface
// Author: Villse
// Video: https://www.youtube.com/watch?v=uc3gUeSnkPM
// Source: https://sudokupad.app/rhgtkqogf2

// PH1..PH8 assign the eight poker categories to hands A..H. Their
// all-different constraint makes every listed category occur exactly once.
const hands = [
  {label: 'A', total: 25, cells: ['R1C2', 'R3C9', 'R4C4', 'R6C6', 'R8C4']},
  {label: 'B', total: 25, cells: ['R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9']},
  {label: 'C', total: 29, cells: ['R1C8', 'R1C9', 'R2C7', 'R2C8', 'R3C8']},
  {label: 'D', total: 29, cells: ['R5C6', 'R5C7', 'R6C7', 'R7C7', 'R8C7']},
  {label: 'E', total: 33, cells: ['R5C3', 'R6C3', 'R6C4', 'R7C4', 'R7C5']},
  {label: 'F', total: 27, cells: ['R3C3', 'R4C2', 'R4C3', 'R5C1', 'R5C2']},
  {label: 'G', total: 12, cells: ['R3C2', 'R2C5', 'R2C6', 'R3C6', 'R5C5']},
  {label: 'H', total: null, cells: ['R2C2', 'R2C3', 'R2C4', 'R3C4', 'R3C5']},
];

const categories = new Var('PH', 'poker hand category', hands.length);
const categoryCells = categories.cells();

// Multiplicity hands are regular languages over five digits. Separate machines
// keep each compiled state space below ISS's finite state limit.
const multiplicityMachine = target => NFA.encodeSpec({
  startState: {counts: []},
  transition: ({counts}, value) => {
    const next = counts.map(([digit, count]) => [digit, count]);
    const entry = next.find(([digit]) => digit === value);
    if (entry) entry[1] += 1;
    else next.push([value, 1]);
    next.sort(([a], [b]) => a - b);

    // No partial multiplicity may exceed the final pattern's largest group.
    if (next.some(([, count]) => count > target[0])) return undefined;
    return {counts: next};
  },
  accept: ({counts}) => {
    const frequencies = counts.map(([, count]) => count).sort((a, b) => b - a);
    return frequencies.join() === target.join();
  },
  maxDepth: 5,
}, 9);

const multiplicityMachines = new Map([
  [2, multiplicityMachine([2, 1, 1, 1])], // pair
  [3, multiplicityMachine([2, 2, 1])], // two pair
  [4, multiplicityMachine([3, 1, 1])], // three of a kind
  [7, multiplicityMachine([3, 2])], // full house
  [8, multiplicityMachine([4, 1])], // four of a kind
]);

function categoryProperty(category, cells) {
  if (category === 1) return new AllDifferent(...cells); // high card
  if (category === 5) return new Renban(...cells); // straight
  if (category === 6) { // flush: all black/even or all red/odd
    return new Or([
      new And(cells.map(cell => new Given(cell, 2, 4, 6, 8))),
      new And(cells.map(cell => new Given(cell, 1, 3, 5, 7, 9))),
    ]);
  }
  return new NFA(multiplicityMachines.get(category), `category ${category}`, ...cells);
}

// Each implication is encoded as (category is not k) OR (hand has property k).
function categoryRules(categoryCell, cells) {
  return Array.from({length: 8}, (_, index) => index + 1).map(category =>
    new Or([
      new Given(categoryCell, ...Array.from({length: 8}, (_, index) => index + 1)
        .filter(value => value !== category)),
      categoryProperty(category, cells),
    ]));
}

const sums = hands
  .filter(({total}) => total !== null)
  .map(({label, total, cells}) => new Sum(total, ...cells));

const handTypes = hands.flatMap(({cells}, index) =>
  categoryRules(categoryCells[index], cells));

return [
  new Shape('9x9'),
  categories,
  new AllDifferent(...categories.cells()),
  ...sums,
  ...handTypes,
];
