import osmnx as ox
import sys
import json
from shapely.geometry import Polygon
import matplotlib.pyplot as plt
import networkx as nx
import heapq

def generate_route(attractions):
  latitudes = [attraction['lat'] for attraction in attractions]
  longitudes = [attraction['lng'] for attraction in attractions]
  
  min_lat = min(latitudes)
  max_lat = max(latitudes)
  min_lng = min(longitudes)
  max_lng = max(longitudes)

  lat_buffer = (max_lat - min_lat) * 0.1
  lng_buffer = (max_lng - min_lng) * 0.1

  min_lat -= lat_buffer
  max_lat += lat_buffer
  min_lng -= lng_buffer
  max_lng += lng_buffer

  polygon = Polygon([(min_lng, min_lat), (max_lng, min_lat), (max_lng, max_lat), (min_lng, max_lat), (min_lng, min_lat)])

  G = ox.graph_from_polygon(polygon, network_type='drive', simplify=True)
  
  intersections = [(node, data['y'], data['x']) for node, data in G.nodes(data=True)]
  intersections = sorted(intersections, key= lambda x: (-x[1], x[2]))

  weighted_intersections = {}
  for attraction in attractions:
    closest_intersection = ox.nearest_nodes(G, attraction['lng'], attraction['lat'])
    if closest_intersection not in weighted_intersections:
      weighted_intersections[closest_intersection] = []
    weighted_intersections[closest_intersection].append(attraction)
  
  weighted_graph = create_weighted_graph(G, weighted_intersections)
  start = min(weighted_graph.nodes, key=lambda x: weighted_graph.nodes[x]['y'])
  path, attractions_count = find_route(weighted_graph, start)

  route_attractions = []
  for node in path:
    if 'attractions' in weighted_graph.nodes[node]:
      route_attractions.extend(weighted_graph.nodes[node]['attractions'])

  return route_attractions

def create_weighted_graph(G, weighted_intersections):
  weighted_graph = nx.Graph()
  attraction_factor = 0.5

  for node1, node2, data in G.edges(data=True):
    weight=data['length']
    if node1 in weighted_intersections or node2 in weighted_intersections:
      weight *= attraction_factor
    weighted_graph.add_edge(node1, node2, weight=weight)
  
  for node, data in G.nodes(data=True):
    weighted_graph.add_node(node, **data)

  for intersection, attractions in weighted_intersections.items():
    if intersection in weighted_graph.nodes:
      weighted_graph.nodes[intersection]['attractions'] = attractions
    else:
      weighted_graph.add_node(intersection, attractions=attractions)

  return weighted_graph

def find_route(graph, start):
  queue = []
  visited = set()
  max_attractions = 0
  best_path = []

  heapq.heappush(queue, (0, start, 0, [start]))
  while queue:
    cost, node, attractions_count, path = heapq.heappop(queue)
    if node in visited:
      continue
    visited.add(node)

    if attractions_count > max_attractions:
      max_attractions = attractions_count
      best_path = path
    
    for neighbor, edge in graph[node].items():
      if neighbor not in visited:
        new_cost = cost + edge['weight']
        new_count = attractions_count + len(graph.nodes[neighbor].get('attractions', []))
        heapq.heappush(queue, (new_cost, neighbor, new_count, path + [neighbor]))

  return best_path, max_attractions

if __name__ == "__main__":
  attractions_data = sys.stdin.read()
  attractions = json.loads(attractions_data)
  # print(attractions)
  route = generate_route(attractions)
  print(json.dumps(route, ensure_ascii=False))
