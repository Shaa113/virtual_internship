# Dijkstra's Algorithm Implementation
# Practical Use of AI Tools in Programming - Task 2
# Generates shortest paths from a single source node in a weighted graph

import heapq

def dijkstra(graph, start):
    """
    Computes shortest path distances from a source node in a weighted graph.
    graph: A dictionary mapping nodes to lists of tuples (neighbor, weight)
    start: The starting node
    
    Time Complexity: O((V + E) log V) using a binary heap
    Space Complexity: O(V) to store distances and priority queue
    """
    # Initialize distances to infinity and start node to 0
    distances = {node: float('infinity') for node in graph}
    distances[start] = 0
    
    # Priority queue storing elements of form (distance, node)
    pq = [(0, start)]
    
    while pq:
        current_distance, current_node = heapq.heappop(pq)
        
        # Nodes can be pushed onto pq multiple times, skip if we found a shorter path already
        if current_distance > distances[current_node]:
            continue
            
        # Explore neighbors
        for neighbor, weight in graph[current_node].items():
            distance = current_distance + weight
            
            # If a shorter path to neighbor is found, update and push to priority queue
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(pq, (distance, neighbor))
                
    return distances

# Simple driver code for manual verification
if __name__ == '__main__':
    # Graph represented as an adjacency list
    weighted_graph = {
        'A': {'B': 4, 'C': 2},
        'B': {'C': 3, 'D': 2, 'E': 3},
        'C': {'B': 1, 'D': 4, 'E': 5},
        'D': {'E': 1},
        'E': {}
    }
    
    start_node = 'A'
    print(f"Graph Adjacency List: {weighted_graph}")
    print(f"Calculating shortest paths starting from node '{start_node}'...")
    
    shortest_paths = dijkstra(weighted_graph, start_node)
    
    print("\nShortest Distances from source:")
    for dest, dist in shortest_paths.items():
        print(f" Node '{dest}' : Distance = {dist}")
