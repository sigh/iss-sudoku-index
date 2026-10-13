// Title: Embark
// Author: dumediat
// Video: https://www.youtube.com/watch?v=McpXOTGAz1E
// Source: https://tinyurl.com/3wbmu73f

// Nine disjoint 3x3 regions contain 1-9, without digit repeats in rows,
// columns or cages. Empty cells contribute zero to cage totals. Arrow
// digits count shaded cells on their rays. Shading is nonadjacent and
// all unshaded empty cells form one non-intersecting loop. Black printed cells
// are fixed shaded. Fog is reveal UI.
const either = (...constraints) => new Or(constraints);
const together = (...constraints) => new And(constraints);
const shape = new Shape('14x14', '0-15', 'Raw');
const graph = cellGraph(shape);
const shade = graph.makeOverlay('VS');
const shadeVar = shade.toVar('cell kind');
const posA = graph.makeOverlay('VA'), posB = graph.makeOverlay('VB');
const varA = posA.toVar('position modulo 13'), varB = posB.toVar('position modulo 15');
const cells = graph.cells();
const placementVar = new Var('P','3x3 placements',144);
const digits = [1,2,3,4,5,6,7,8,9];
// VP holds a boolean for each of the 12x12 possible top-left corners.
const placements = Array.from({length:144}, (_,i) => ({
  flag: placementVar.cell(i+1), r:Math.floor(i/12)+1, c:i%12+1,
  cells:Array.from({length:9},(_,j)=>makeCellId(Math.floor(i/12)+1+Math.floor(j/3),i%12+1+j%3))
}));
// Zero is empty, so only equal nonzero values violate distinctness.
const distinct = Pair.fnToKey((a,b)=>a===0||b===0||a!==b,shape);
const unitPairs = unit => [new PairX(distinct,'digits distinct',...unit)];
const regionRules = placements.map(p=>either(
 new Given(p.flag,0),together(new Given(p.flag,1),new AllDifferent(...p.cells),...p.cells.map(c=>new Given(c,...digits)))
));
const membership = Array.from({length:196},(_,i)=>{
 const r=Math.floor(i/14)+1,c=i%14+1,cell=makeCellId(r,c);
 const flags=placements.filter(p=>p.r<=r&&r<p.r+3&&p.c<=c&&c<p.c+3).map(p=>p.flag);
 return either(together(new Given(cell,0),new Sum(0,...flags)),together(new Given(cell,...digits),new Sum(1,...flags)));
});
// Codes 0 and 1 are digit and black; codes 2-13 are ordered predecessor/
// successor port pairs. Directions are north, west, east, south in reading order.
const directions=[[-1,0],[0,-1],[0,1],[1,0]];
const ports=[null,null,...directions.flatMap((_,p)=>directions.flatMap((_,q)=>p===q?[]:[{pred:p,succ:q}]))];
const body=v=>v>=2&&v<=13;
const shadeKey = Pair.fnToKey((d,k)=>d===0?k>=1&&k<=13:k===0,shape);
const nonadjacent = Pair.fnToKey((a,b)=>a!==1||b!==1,shape);
const shadeRules=cells.map(c=>new Pair(shadeKey,'cell kind',c,shade.at(c)));
const domainRules=cells.flatMap(c=>[
 new Pair(Pair.fnToKey((k,v)=>body(k)?v>=1&&v<=13:v===0,shape),'mod13 domain',shade.at(c),posA.at(c)),
 new Pair(Pair.fnToKey((k,v)=>body(k)?v>=1&&v<=15:v===0,shape),'mod15 domain',shade.at(c),posB.at(c))
]);
// Nine regions occupy 81 cells, leaving at most 115 loop cells. The coprime
// moduli have product 195, so no seam-free secondary cycle can close.
const nextA=Pair.fnToKey((a,b)=>a>=1&&a<=13&&b===a%13+1,shape);
const nextB=Pair.fnToKey((a,b)=>a>=1&&a<=15&&b===a%15+1,shape);
const edgeRules=cells.flatMap(c=>{
 const {row:r,col:col}=parseCellId(c);
 return directions.flatMap(([dr,dc],dir)=>{
  const rr=r+dr,cc=col+dc;
  if(rr<1||rr>14||cc<1||cc>14)
   return [new Given(shade.at(c),...ports.flatMap((p,i)=>!p||(p.pred!==dir&&p.succ!==dir)?[i]:[]))];
  const d=makeCellId(rr,cc),opp=3-dir;
  // Agreement relates each directed outgoing edge to its neighbour's incoming edge.
  const agree=Pair.fnToKey((a,b)=>(body(a)&&ports[a].succ===dir)===(body(b)&&ports[b].pred===opp),shape);
  const unused=Pair.fnToKey((a,b)=>!body(a)||ports[a].succ!==dir,shape);
  return [either(new Pair(unused,'unused outgoing edge',shade.at(c),shade.at(d)),
    together(new Given(posA.at(d),1),new Given(posB.at(d),1)),
    together(new Pair(nextA,'next modulo13',posA.at(c),posA.at(d)),new Pair(nextB,'next modulo15',posB.at(c),posB.at(d))))];
 });
});
// The first loop cell in reading order is the sole seam (both counters 1).
// Its successor precedes its predecessor, fixing the loop's orientation.
// Other loop cells cannot be seams. Off cells have both counters zero.
const seamSpec=NFA.encodeSpec({startState:{found:false,phase:0,first:false,aOne:false},transition:(s,v)=>{
 if(s.phase===0){
  const first=!s.found&&body(v);
  if(first&&ports[v].succ>ports[v].pred)return undefined;
  return {found:s.found||body(v),phase:1,first,aOne:false};
 }
 if(s.phase===1){if(s.first&&v!==1)return undefined;return {...s,phase:2,aOne:v===1};}
 if(s.first?v!==1:s.aOne&&v===1)return undefined;
 return {found:s.found,phase:0,first:false,aOne:false};
},accept:s=>s.found&&s.phase===0},shape);
const seam=new NFA(seamSpec,'canonical loop seam',...cells.flatMap(c=>[shade.at(c),posA.at(c),posB.at(c)]));
// Cage coordinates and totals are the drawn dashed cages.
const cageData = [[13, [[14, 13], [14, 14]]], [16, [[11, 12], [11, 13], [12, 13]]], [15, [[9, 12], [10, 12], [10, 13]]], [4, [[11, 10], [11, 11], [12, 11], [12, 12]]], [11, [[10, 9], [11, 9]]], [10, [[11, 6], [11, 7], [12, 6]]], [13, [[9, 3], [9, 4], [9, 5], [10, 5]]], [12, [[7, 2], [8, 2], [8, 3]]], [11, [[4, 3], [5, 3], [6, 3], [7, 3]]], [8, [[4, 1], [4, 2], [5, 1], [6, 1], [7, 1]]], [15, [[3, 4], [3, 5], [3, 6], [3, 7]]], [9, [[4, 6], [5, 6], [5, 7]]], [9, [[6, 8], [6, 9]]], [10, [[7, 7], [7, 8], [8, 8]]], [18, [[3, 11], [3, 12], [4, 12]]], [14, [[2, 8], [3, 8], [3, 9], [3, 10], [4, 10]]], [12, [[1, 7], [2, 7]]], [13, [[11, 5], [12, 5]]], [2, [[4, 8], [4, 9], [5, 9]]], [10, [[2, 2], [3, 2]]], [14, [[2, 3], [2, 4]]]];
const cageRules=cageData.flatMap(([total,coords])=>{
 const cs=coords.map(([r,c])=>makeCellId(r,c));return [new Sum(total,...cs),...unitPairs(cs)];
});
// Arrow coordinates and directions are the drawn rotated arrow glyphs.
const arrowData = [[1, 8, 1, 0], [4, 3, 1, 0], [2, 10, 1, 0], [2, 12, 0, 1], [7, 9, 0, 1], [9, 2, 0, 1], [10, 14, -1, 0], [12, 10, -1, 0], [12, 7, 0, -1], [13, 14, 0, -1], [14, 12, 0, -1]];
// State first reads the clue digit, then counts shaded cells down the ray.
const arrowSpec=NFA.encodeSpec({startState:{target:null,count:0},transition:(s,v)=>{
 if(s.target===null)return v>0?{target:v,count:0}:undefined;
 const count=s.count+(v===1?1:0);return count<=s.target?{target:s.target,count}:undefined;
},accept:s=>s.target!==null&&s.count===s.target},shape);
const arrowRules=arrowData.map(([r,c,dr,dc])=>{
 const ray=[];for(let rr=r+dr,cc=c+dc;rr>=1&&rr<=14&&cc>=1&&cc<=14;rr+=dr,cc+=dc)ray.push(shadeVar.cell(rr,cc));
 return new NFA(arrowSpec,'shaded count',makeCellId(r,c),...ray);
});
// Printed black cells; the app keeps black fills and hides grey answer fills.
const printedBlack=[[4,14],[6,3],[6,6],[9,10],[10,1],[12,4],[14,8]];
return [shape,placementVar,shadeVar,varA,varB,
 ...printedBlack.map(([r,c])=>new Given(shadeVar.cell(r,c),1)),
 graph.makeOverlay('VP',cells.slice(0,144)).makeReplicate(new Given(placementVar.cell(1),0,1)),
 shade.makeReplicate(new Given(shadeVar.cell(1,1),...Array.from({length:14},(_,i)=>i))),
 new Sum(9,...placements.map(p=>p.flag)),...regionRules,...membership,
 ...graph.rows().flatMap(unitPairs),...graph.columns().flatMap(unitPairs),
 graph.makeReplicate(new Given(makeCellId(1,1),0,...digits)),
 ...shadeRules,...domainRules,...edgeRules,seam,
 ...directions.map(([dr,dc],dir)=>{
  const opp=3-dir;
  const agree=Pair.fnToKey((a,b)=>(body(a)&&ports[a].succ===dir)===(body(b)&&ports[b].pred===opp),shape);
  // Replicate uses the first cell as origin; negative steps anchor the template
  // one cell inward so both ends remain on the board after translation.
  const r=dr<0?2:1,c=dc<0?2:1;
  const targets=shade.cells().filter(v=>{const q=parseCellId(shade.gridAt(v));return q.row+dr>=1&&q.row+dr<=14&&q.col+dc>=1&&q.col+dc<=14;});
  return new Replicate([new Pair(agree,'directed edge agreement',shadeVar.cell(r,c),shadeVar.cell(r+dr,c+dc))],Replicate.encodeTargetCells(targets,shadeVar.cell(r,c),shade),shadeVar.cell(r,c));
 }),
 shade.makeReplicate(new Pair(nonadjacent,'no adjacent shading',shadeVar.cell(1,1),shadeVar.cell(2,1)),shade.cells().filter(c=>parseCellId(shade.gridAt(c)).row<14)),
 shade.makeReplicate(new Pair(nonadjacent,'no adjacent shading',shadeVar.cell(1,1),shadeVar.cell(1,2)),shade.cells().filter(c=>parseCellId(shade.gridAt(c)).col<14)),
 ...cageRules,...arrowRules];
