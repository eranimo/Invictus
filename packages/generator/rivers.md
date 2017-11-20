# River generation with Fractal Pathfinding

1. Fractal Pathfinding: https://gamedev.stackexchange.com/questions/128170/river-to-nowhere-how-do-i-make-a-pathfinder-move-to-a-destination-that-doesnt
2. Meander geometry: https://divisbyzero.com/2009/11/26/the-geometry-of-meandering-rivers/
- Pick random points in a high altitude (source)
- Find nearest coastal cell (destination)
- river data structure has:
  - source cell
  - destination cell
  - path array of river cells
    - x & y coordinate
    - change in elevation
    - next cell
    - previous cell
  - branch count (default of 1)
- WORLD STEP:
  - Pathfinding:
    find a path from source to destination
    - create a graph where edges go from cells to their lowest neighbor lower than themselves
      - prefer a path closer to the destination (use distance function)
    - if pathfind encounters another river:
      - stop pathfinding
      - increase that river's branchCount by one
      - set destination to this cell
- CHUNK STEP:
  - Pathfinding:
    calculate each river cell in the chunk space
    - use same pathfinding between consecutive cells in the river
      to get a continous path to the destination
  - Polishing:
    for each cell in the river:
    - increase size of river cell in proportion to the branch count
    - lower the terrain around river cells in proportion to:
      - the branch count (lower wider area if number is lower)
      - the change in elevation (lower less area if higher difference)
    - mark cells as flood plains if the change in elevation within 4 cells is less than 2
    - mark cells as sand if they border a river cell that has a change in elevation less than 2


```
000000000*0000000
00000*****000000
00000*$$000000000
00000***$00000000
000000$**$0000000
0000000$*00000000
00000000*00000000
```
