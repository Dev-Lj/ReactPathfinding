import Node from "../PathFinder/Node";

class PathFinder {
  #unvisitedNodes;

  init(grid) {
    this.#unvisitedNodes = this.gridToUnvisited(grid);
  }

  gridToUnvisited(grid) {
    // 2D Array to 1D Array
    var unvisitedNodes = [];
    for (let row of grid) {
      for (let node of row) {
        var newNode = new Node(node.coordinates.X, node.coordinates.Y);
        unvisitedNodes.push(newNode);
        if (node.isTargetNode) {
          newNode.setTargetNode(true);
        }
        if (node.isStartNode) {
          newNode.setDistanceToStartNode(0);
        }
      }
    }
    return unvisitedNodes;
  }

  // doDijkstra should return path to node,
  // aswell as each node visited for visual
  // reconstruction
  doPathFinding() {
    if (!this.#unvisitedNodes) {
      throw new Error("No nodes were set.");
    }
    var visitedNodes = [];

    while (this.#unvisitedNodes.length) {
      this.sortByDistance(this.#unvisitedNodes);
      let currentNode = this.#unvisitedNodes.shift();
      if (currentNode.isTargetNode())
        return {
          visitedNodes,
          shortestPath: this.getShortestPath(currentNode),
        };
      let neighbours = this.getUnvisitedNeighbours(currentNode);
      this.updateNeighbours(neighbours, currentNode);
      currentNode.setVisited();
      visitedNodes.push(currentNode);
    }
  }

  getShortestPath(targetNode) {
    var shortestPath = [];
    var lastNode = targetNode.getLastNode();
    while (lastNode) {
      shortestPath.push(lastNode);
      lastNode = lastNode.getLastNode();
    }
    return shortestPath;
  }

  getUnvisitedNeighbours(node) {
    const x = node.getXPos();
    const y = node.getYPos();
    return this.#unvisitedNodes.filter((node) => {
      let nodeXPos = node.getXPos();
      let nodeYPos = node.getYPos();
      return (
        !node.isVisited() &&
        ((nodeXPos === x + 1 && nodeYPos === y) ||
          (nodeXPos === x - 1 && nodeYPos === y) ||
          (nodeXPos === x && nodeYPos === y + 1) ||
          (nodeXPos === x && nodeYPos === y - 1))
      );
    });
  }

  updateNeighbours(neighbours, currentNode) {
    var distanceOfNeighbour = currentNode.getDistanceToStartNode() + 1;
    for (let neighbour of neighbours) {
      neighbour.setDistanceToStartNode(distanceOfNeighbour);
      neighbour.setLastNode(currentNode);
    }
  }

  sortByDistance(nodes) {
    nodes.sort(
      (a, b) => a.getDistanceToStartNode() - b.getDistanceToStartNode()
    );
  }
}

export default PathFinder;
