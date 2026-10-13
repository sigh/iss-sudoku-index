// Title: X-clusivity
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=0qGJVHcQCQA
// Source: https://app.crackingthecryptic.com/sudoku/JGG2RDFhJq

// Normal Sudoku. Each line partitions into consecutive sum-10 groups;
// no completed group anywhere has the same digit multiset as another.
const shape = new Shape('9x9');

// The six grey paths, in their drawn waypoint order.
const lines = [
  ['R1C7','R2C7','R3C7','R4C7'],
  ['R4C5','R3C6','R2C5','R1C4','R2C3'],
  ['R6C9','R7C9','R8C9','R8C8','R8C7'],
  ['R8C5','R7C6','R7C5','R7C4'],
  ['R9C1','R9C2','R8C2','R7C2','R6C2','R6C3','R6C4','R5C5','R5C6','R5C7','R4C8','R4C9','R3C9','R2C9','R1C9'],
  ['R3C2','R2C2','R1C1','R2C1','R3C1'],
];
const sumLines = lines.map(line => new SumLine(10, ...line));

// Enumerate digit multisets summing to 10, not assignments or partitions of
// the drawn lines. One machine remembers whether each multiset was used.
const fills = [];
function enumerateFills(remaining, minimum, digits) {
  if (remaining === 0) { fills.push(digits); return; }
  for (let value = minimum; value <= Math.min(9, remaining); value++) {
    enumerateFills(remaining - value, value, [...digits, value]);
  }
}
enumerateFills(10, 1, []);
const exclusiveGroups = fills.map(fill => {
  const initial = Array(9).fill(0);
  for (const value of fill) initial[value - 1]++;
  // sum locates group boundaries; remaining tracks the target multiset,
  // or null after a mismatch. used survives breaks between drawn lines.
  const spec = NFA.encodeSpec({
    startState: { sum: 0, remaining: initial, used: false },
    transition: ({sum, remaining, used}, value) => {
      if (value === SEGMENT_BREAK) {
        return sum === 0 ? { sum: 0, remaining: initial, used } : undefined;
      }
      const nextSum = sum + value;
      if (nextSum > 10) return undefined;
      let nextRemaining = null;
      if (remaining !== null && remaining[value - 1] > 0) {
        nextRemaining = remaining.slice();
        nextRemaining[value - 1]--;
      }
      if (nextSum === 10) {
        const matched = nextRemaining !== null;
        if (matched && used) return undefined;
        return { sum: 0, remaining: initial, used: used || matched };
      }
      return { sum: nextSum, remaining: nextRemaining, used };
    },
    accept: ({sum}) => sum === 0,
  }, shape, {multiSegment: true});
  return new NFA(spec, `Exclusive ${fill.join('')}`, ...lines);
});
return [shape, ...sumLines, ...exclusiveGroups];
