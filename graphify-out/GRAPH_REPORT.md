# Graph Report - TopAvenue  (2026-05-04)

## Corpus Check
- 19 files · ~22,634 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 96 nodes · 70 edges · 4 communities detected
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4883f582`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]

## God Nodes (most connected - your core abstractions)
1. `log()` - 5 edges
2. `log()` - 3 edges
3. `checkFile()` - 3 edges
4. `run()` - 3 edges
5. `checkFile()` - 3 edges
6. `run()` - 3 edges
7. `computeNights()` - 2 edges
8. `BookingFlow()` - 2 edges
9. `seed()` - 2 edges
10. `testConnection()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `seed()` --calls--> `log()`  [INFERRED]
  seedRooms.js → scripts/health-check.js
- `testConnection()` --calls--> `log()`  [INFERRED]
  testSupabase.js → scripts/health-check.js

## Communities (34 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.36
Nodes (5): checkFile(), log(), run(), seed(), testConnection()

### Community 7 - "Community 7"
Cohesion: 1.0
Nodes (3): checkFile(), log(), run()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 2 inferred relationships involving `log()` (e.g. with `seed()` and `testConnection()`) actually correct?**
  _`log()` has 2 INFERRED edges - model-reasoned connections that need verification._