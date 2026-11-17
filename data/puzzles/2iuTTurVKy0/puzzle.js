// Title: Cornered
// Author: Derek LeClair
// Video: https://www.youtube.com/watch?v=2iuTTurVKy0
// Source: https://sudokupad.app/tfk5cgsl3q

// Encode row/column uniqueness, anti-knight, both dot colours, and a partition
// into differently sized L regions containing 0..N-1, with the circled corner
// equal to the leg-length difference. No rules are omitted.
const shape = new Shape('7x7', '0-9');
const regions = [];
const cells = [];
for (let r = 1; r <= 7; r++) for (let c = 1; c <= 7; c++) {
  cells.push({r, c, id: makeCellId(r, c)});
}
// The seven drawn circle centres, in reading order.
const corners = [[1,7], [2,1], [3,5], [4,6], [5,2], [6,7], [7,1]];

// Each branch describes one local L, not a precomputed partition. Its label
// occurs exactly on that L; sharing the identity layer makes branches tile.
// Seven marked corners force seven regions: eight distinct sizes >=3 need 52 cells.
for (let k = 0; k < corners.length; k++) {
  const [r,c] = corners[k];
  const alternatives = [];
  for (const dr of [-1,1]) for (const dc of [-1,1]) {
    for (let h = 2; h <= 7; h++) for (let w = 2; w <= 7; w++) {
      const n = h+w-1;
      if (n > 10 || r+dr*(h-1)<1 || r+dr*(h-1)>7 || c+dc*(w-1)<1 || c+dc*(w-1)>7) continue;
      const members = cells.filter(x => (x.r===r && (x.c-c)*dc>=0 && (x.c-c)*dc<w) || (x.c===c && (x.r-r)*dr>=0 && (x.r-r)*dr<h));
      const ids = members.map(x=>x.id);
      const chosen = new Set(ids);
      const branch = [new Given('VS'+(k+1), n-1), new Given(makeCellId(r,c), Math.abs(h-w)), new AllDifferent(...ids)];
      for (let i=0; i<49; i++) {
        branch.push(new Given('VL'+(i+1), ...(chosen.has(cells[i].id) ? [k] : [0,1,2,3,4,5,6].filter(v=>v!==k))));
      }
      for (const id of ids) branch.push(new Given(id, ...Array.from({length:n},(_,i)=>i)));
      alternatives.push(new And(branch));
    }
  }
  regions.push(new Or(alternatives));
}
// Drawn white-filled and black-filled edge dots.
const dots = [new WhiteDot('R2C7','R3C7'), new WhiteDot('R4C1','R5C1'),
  new BlackDot('R3C1','R3C2'), new BlackDot('R1C5','R2C5')];
return [shape, new NoBoxes(), new AntiKnight(),
  new Var('L', 'Region identity', 49), new Var('S', 'Region size minus one', 7),
  ...cells.map((_, i) => new Given('VL'+(i+1), 0,1,2,3,4,5,6)),
  new AllDifferent(...corners.map((_,k) => 'VS'+(k+1))),
  ...regions, ...dots];
