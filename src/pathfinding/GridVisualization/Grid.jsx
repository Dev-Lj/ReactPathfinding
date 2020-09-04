import { NodeVisual, CLICKMODE_START, CLICKMODE_TARGET } from "./NodeVisual";
import React from "react";

const NODE_AMOUNT_X = 40;
const NODE_AMOUNT_Y = 40;

class Grid extends React.Component {
  #startNode;
  #targetNode;

  constructor(props) {
    super(props);
    this.state = {
      nodesGrid: [],
      isPathfindingRunning: false,
    };
    this.nodeClicked = this.nodeClicked.bind(this);
  }

  componentDidMount() {
    this.initGrid();
  }

  initGrid() {
    const nodesGrid = createNodesVisualGrid(NODE_AMOUNT_X, NODE_AMOUNT_Y);
    this.setState({
      nodesGrid,
    });
  }

  formatNodes(grid) {
    return grid.map((row, y) => {
      return (
        <div key={y} className="row justify-content-center">
          {row.map((node, x) => {
            return (
              <NodeVisual
                key={node.key}
                coordinates={node.coordinates}
                isVisited={node.isVisited}
                isStartNode={node.isStartNode}
                isTargetNode={node.isTargetNode}
                isWay={node.isWay}
                nodeClicked={this.nodeClicked}
              />
            );
          })}
        </div>
      );
    });
  }

  nodeClicked(node) {
    let cord = node.getCoordinates();

    switch (this.props.clickMode) {
      case CLICKMODE_START:
        this.setStartNode(cord);
        break;
      case CLICKMODE_TARGET:
        this.setTargetNode(cord);
        break;
      default:
        alert(`Invalid clickmode: ${this.props.clickMode}`);
    }
    this.setState({ nodesGrid: [...this.state.nodesGrid] });
  }

  setStartNode(coordinates) {
    var clickedNode = this.state.nodesGrid[coordinates.Y][coordinates.X];
    if (this.#startNode) {
      this.#startNode.isStartNode = false;
    }
    clickedNode.isStartNode = true;
    this.#startNode = clickedNode;
  }

  setTargetNode(coordinates) {
    var clickedNode = this.state.nodesGrid[coordinates.Y][coordinates.X];
    if (this.#targetNode) {
      this.#targetNode.isTargetNode = false;
    }
    clickedNode.isTargetNode = true;
    this.#targetNode = clickedNode;
  }

  async startPathFinding() {
    if (this.#startNode === undefined || this.#targetNode === undefined) {
      alert("Start- or targetnode missing. Cannot start Dijkstra");
      return false;
    }
    this.setState({ isPathfindingRunning: true });
    this.props.pathFinder.init(this.state.nodesGrid);
    let { visitedNodes, shortestPath } = this.props.pathFinder.doPathFinding();
    await this.visualizePathFinding(visitedNodes);
    await this.visualizeShortestPath(shortestPath);
    await sleep(1000);
    this.initGrid();
    this.setStartNode(this.#startNode.coordinates);
    this.setTargetNode(this.#targetNode.coordinates);
    this.setState({ isPathfindingRunning: false });
  }

  async visualizePathFinding(visitedNodes) {
    for (const node of visitedNodes) {
      this.setState((state) => {
        const nodesGrid = [...state.nodesGrid];
        nodesGrid[node.getYPos()][node.getXPos()].isVisited = true;
        return nodesGrid;
      });
      await sleep(10);
    }
  }

  async visualizeShortestPath(shortestPath) {
    for (const node of shortestPath) {
      this.setState((state) => {
        const nodesGrid = [...state.nodesGrid];
        nodesGrid[node.getYPos()][node.getXPos()].isWay = true;
        return nodesGrid;
      });
      await sleep(10);
    }
  }

  render() {
    return (
      <div className="container-fluid justify-content-center mt-2">
        <div className="row justify-content-center">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              this.startPathFinding();
            }}
            disabled={this.state.isPathfindingRunning}
          >
            Animate Dijkstra
          </button>
        </div>
        <div className="container">
          {this.formatNodes(this.state.nodesGrid)}
        </div>
      </div>
    );
  }
}

function createNodesVisualGrid(amountX, amountY) {
  var nodesGrid = [];
  for (let y = 0; y < amountY; y++) {
    nodesGrid[y] = [];
    for (let x = 0; x < amountX; x++) {
      nodesGrid[y][x] = {
        key: "" + y + x,
        coordinates: { Y: y, X: x },
        isVisited: false,
        isStartNode: false,
        isTargetNode: false,
        isWay: false,
      };
    }
  }
  return nodesGrid;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default Grid;
