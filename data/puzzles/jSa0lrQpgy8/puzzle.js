// Title: The Usual Suspects
// Author: zetamath
// Video: https://www.youtube.com/watch?v=jSa0lrQpgy8
// Source: https://app.crackingthecryptic.com/sudoku/B3Rd8LDrdQ
//
// Normal sudoku (default rows/columns/3x3 boxes). One given: R2C8=5.
//
// Cages: digits in a cage are always mutually distinct (drawn cage
// convention); whether the cage's printed total actually holds is decided by
// the meta-rule below.
// Little killers: the diagonal sum outside the grid; its digits may repeat
// (rules text: "Such digits may repeat if allowed by normal sudoku rules").
// Cell paths below are each outside badge's arrow-confirmed diagonal.
//
// Meta-rule: "for each total exactly one of the cages or little killers with
// that total is wrong." Every printed total groups into exactly 3 members
// (cage and/or little killer); within each group exactly one member's actual
// digit-sum differs from the printed total and the other two genuinely sum
// to it. Encoded with one correctness flag Var per member (1 = correct,
// 2 = wrong) restricted to {1,2}, one NFA per member checking the flag
// against the member's own running sum, and one ContainExact("1_1_2", ...)
// per group of 3 flags to force exactly one "wrong" per group.

const cages = [
  { total: 11, cells: ['R1C1', 'R1C2', 'R2C1'] },
  { total: 12, cells: ['R1C3', 'R1C4', 'R1C5', 'R1C6'] },
  { total: 23, cells: ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9'] },
  { total: 17, cells: ['R2C7', 'R3C7', 'R3C8'] },
  { total: 10, cells: ['R3C5', 'R3C6'] },
  { total: 12, cells: ['R3C1', 'R4C1', 'R5C1', 'R6C1'] },
  { total: 23, cells: ['R4C2', 'R4C3', 'R4C4', 'R4C5'] },
  { total: 18, cells: ['R5C3', 'R6C3', 'R7C3'] },
  { total: 14, cells: ['R8C1', 'R8C2', 'R8C3', 'R8C4'] },
  { total: 17, cells: ['R9C1', 'R9C2', 'R9C3', 'R9C4'] },
  { total: 11, cells: ['R9C5', 'R9C6', 'R9C7'] },
  { total: 17, cells: ['R9C8', 'R9C9'] },
  { total: 8, cells: ['R6C9', 'R7C9', 'R8C9'] },
  { total: 8, cells: ['R5C8', 'R6C8', 'R7C8'] },
  { total: 18, cells: ['R4C7', 'R4C8', 'R4C9'] },
  { total: 10, cells: ['R5C6', 'R5C7'] },
  { total: 12, cells: ['R5C5', 'R6C4', 'R6C5', 'R6C6'] },
  { total: 14, cells: ['R7C4', 'R7C5', 'R8C5', 'R8C6'] },
  { total: 11, cells: ['R2C3', 'R3C2', 'R3C3'] },
  { total: 8, cells: ['R6C7', 'R7C7', 'R8C7'] },
];

// Little killers: outside-badge total + arrow-confirmed diagonal cell path.
const littleKillers = [
  { total: 10, cells: ['R1C7', 'R2C8', 'R3C9'] },
  { total: 30, cells: ['R3C9', 'R4C8', 'R5C7', 'R6C6', 'R7C5', 'R8C4', 'R9C3'] },
  { total: 14, cells: ['R6C9', 'R7C8', 'R8C7', 'R9C6'] },
  { total: 30, cells: ['R9C6', 'R8C5', 'R7C4', 'R6C3', 'R5C2', 'R4C1'] },
  { total: 30, cells: ['R9C5', 'R8C4', 'R7C3', 'R6C2', 'R5C1'] },
  { total: 18, cells: ['R9C3', 'R8C2', 'R7C1'] },
  { total: 23, cells: ['R3C1', 'R2C2', 'R1C3'] },
];

// Every printed total's members (cages and little killers together).
const members = [
  ...cages.map(c => ({ ...c, kind: 'cage' })),
  ...littleKillers.map(lk => ({ ...lk, kind: 'lk' })),
];

const groups = new Map();   // total -> member[]
for (const m of members) {
  if (!groups.has(m.total)) groups.set(m.total, []);
  groups.get(m.total).push(m);
}
for (const [total, group] of groups) {
  if (group.length !== 3) {
    throw new Error(`total ${total} has ${group.length} members, expected 3`);
  }
}

// One correctness flag per member: 1 = printed total holds, 2 = it does not.
// The NFA reads [flag, ...memberCells]: with flag=1 it accepts only the exact
// running sum == total; with flag=2 it accepts any running sum != total. The
// sum is clamped at total+1 so an over-total run stays distinguishable from
// an exact match without an unbounded state count.
function correctnessFlagNFA(total) {
  return NFA.encodeSpec({
    startState: { flag: null, sum: 0 },
    transition: ({ flag, sum }, value) => {
      if (flag === null) return { flag: value, sum: 0 };   // consume the flag cell
      return { flag, sum: Math.min(sum + value, total + 1) };
    },
    accept: ({ flag, sum }) => flag === 1 ? sum === total : sum !== total,
  }, 9);
}

const flagVar = new Var('F', 'per-clue correctness flag (1=correct, 2=wrong)', members.length);
const flagCells = flagVar.cells();

const memberConstraints = members.flatMap((m, i) => [
  new Given(flagCells[i], 1, 2),
  new NFA(correctnessFlagNFA(m.total), `${m.kind} total ${m.total}`, flagCells[i], ...m.cells),
]);

// Cages are real drawn regions: their cells are always mutually distinct,
// independent of whether the printed total turns out correct.
const cageAllDifferent = cages.map(c => new AllDifferent(...c.cells));

// Exactly one "wrong" (flag=2) per group of 3 same-total members.
let idx = 0;
const memberFlagIndex = new Map(members.map(m => [m, idx++]));
const groupConstraints = [...groups.values()].map(group =>
  new ContainExact('1_1_2', ...group.map(m => flagCells[memberFlagIndex.get(m)])));

return [
  new Shape('9x9'),
  new Given('R2C8', 5),
  flagVar,
  ...cageAllDifferent,
  ...memberConstraints,
  ...groupConstraints,
];
