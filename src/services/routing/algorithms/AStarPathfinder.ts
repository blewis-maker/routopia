import type { Coordinates, TerrainData, RoutePreferences } from '@/types';

export class AStarPathfinder {
  private static instance: AStarPathfinder;
  
  private constructor() {}

  static getInstance(): AStarPathfinder {
    if (!AStarPathfinder.instance) {
      AStarPathfinder.instance = new AStarPathfinder();
    }
    return AStarPathfinder.instance;
  }

  findPath(params: {
    start: Coordinates;
    end: Coordinates;
    terrain: TerrainData;
    preferences: RoutePreferences;
  }): Coordinates[] {
    const { start, end, terrain, preferences } = params;
    const openSet = new PriorityQueue<Node>();
    const closedSet = new Set<string>();
    const cameFrom = new Map<string, Node>();
    
    // Initialize start node
    openSet.enqueue({
      position: start,
      gScore: 0,
      fScore: this.heuristic(start, end, preferences),
      parent: null
    });

    while (!openSet.isEmpty()) {
      const current = openSet.dequeue()!;
      
      if (this.isGoal(current.position, end)) {
        return this.reconstructPath(current, cameFrom);
      }

      closedSet.add(this.nodeKey(current.position));

      // Get neighbors considering terrain and preferences
      const neighbors = this.getNeighbors(current, terrain, preferences);

      for (const neighbor of neighbors) {
        if (closedSet.has(this.nodeKey(neighbor.position))) {
          continue;
        }

        const tentativeGScore = current.gScore + this.getCost(
          current.position,
          neighbor.position,
          terrain,
          preferences
        );

        if (tentativeGScore < neighbor.gScore) {
          neighbor.gScore = tentativeGScore;
          neighbor.fScore = tentativeGScore + this.heuristic(
            neighbor.position,
            end,
            preferences
          );
          neighbor.parent = current;
          
          openSet.enqueue(neighbor);
          cameFrom.set(this.nodeKey(neighbor.position), neighbor);
        }
      }
    }

    return []; // No path found
  }

  private heuristic(
    start: Coordinates,
    end: Coordinates,
    preferences: RoutePreferences
  ): number {
    // Calculate base distance
    const distance = this.getDistance(start, end);
    
    // Apply preference weights
    return distance * this.getPreferenceWeight(preferences);
  }

  private getPreferenceWeight(preferences: RoutePreferences): number {
    // Weight calculation based on preferences
    let weight = 1.0;
    
    if (preferences.optimize === 'elevation') {
      weight *= 0.8; // Prefer elevation-optimized paths
    } else if (preferences.optimize === 'time') {
      weight *= 1.2; // Prefer faster paths
    }
    
    return weight;
  }
}