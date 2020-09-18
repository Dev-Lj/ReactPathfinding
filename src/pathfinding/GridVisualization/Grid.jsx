import { NodeVisual, CLICKMODE } from "./NodeVisual";
import React from "react";

const NODE_AMOUNT_X = 60;
const NODE_AMOUNT_Y = 60;

class Grid extends React.Component {
  #startNode;
  #targetNode;
  #wallNodes = [];

  constructor(props) {
    super(props);
    this.state = {
      nodesGrid: [],
      isPathfindingRunning: false,
    };
    this.grid = React.createRef();
    this.nodeClicked = this.nodeClicked.bind(this);
    this.initGrid = this.initGrid.bind(this);
    this.screenTiltEvent = this.screenTiltEvent.bind(this);
  }

  componentDidMount() {
    this.initGrid();
    window.addEventListener("orientationchange", this.screenTiltEvent);
  }

  componentWillUnmount() {
    this.removeEventListener("orientationchange", this.screenTiltEvent);
  }

  screenTiltEvent() {
    var afterOrientationChanged = () => {
      this.initGrid();
      window.removeEventListener("resize", afterOrientationChanged);
    };
    window.addEventListener("resize", afterOrientationChanged);
  }

  initGrid() {
    if (this.state.isPathfindingRunning) {
      return;
    }
    var gridProperties = this.calculateGridProportions();
    const nodesGrid = createNodesVisualGrid(
      gridProperties.Width,
      gridProperties.Height
    );
    if (this.isValidNode(this.#startNode, gridProperties)) {
      let startNode = this.getNode(nodesGrid, this.#startNode.coordinates);
      this.setStartNode(startNode);
    } else {
      this.#startNode = undefined;
    }
    if (this.isValidNode(this.#targetNode, gridProperties)) {
      let targetNode = this.getNode(nodesGrid, this.#targetNode.coordinates);
      this.setTargetNode(targetNode);
    } else {
      this.#targetNode = undefined;
    }
    let oldWallNodes = [...this.#wallNodes];
    this.#wallNodes = [];
    oldWallNodes.forEach((node) => {
      if (this.isValidNode(node, gridProperties)) {
        let wallNode = this.getNode(nodesGrid, node.coordinates);
        this.setWallNode(wallNode, true);
      }
    });
    this.setState({
      nodesGrid,
    });
  }

  isValidNode(node, gridProperties) {
    return (
      node &&
      node.coordinates.X < gridProperties.Width &&
      node.coordinates.Y < gridProperties.Height
    );
  }

  calculateGridProportions() {
    let doableWidth = Math.floor(this.grid.current.offsetWidth / 15) - 2;
    let doableHeight =
      Math.floor((window.innerHeight - this.grid.current.offsetTop) / 15) - 2;
    return {
      Width: doableWidth < NODE_AMOUNT_X ? doableWidth : NODE_AMOUNT_X,
      Height: doableHeight < NODE_AMOUNT_Y ? doableHeight : NODE_AMOUNT_Y,
    };
  }

  formatNodes(grid) {
    return grid.map((row, y) => {
      return (
        <div key={y} className="row justify-content-center flex-nowrap">
          {row.map((node, x) => {
            return (
              <NodeVisual
                key={node.key}
                coordinates={node.coordinates}
                isVisited={node.isVisited}
                isStartNode={node.isStartNode}
                isTargetNode={node.isTargetNode}
                isWay={node.isWay}
                isWallNode={node.isWallNode}
                nodeClicked={this.nodeClicked}
              />
            );
          })}
        </div>
      );
    });
  }

  nodeClicked(node) {
    if (this.state.isPathfindingRunning) {
      return;
    }

    let clickedNode = this.getNode(this.state.nodesGrid, node.getCoordinates());

    switch (this.props.clickMode) {
      case CLICKMODE.START:
        this.setStartNode(clickedNode);
        break;
      case CLICKMODE.TARGET:
        this.setTargetNode(clickedNode);
        break;
      case CLICKMODE.WALL:
        this.setWallNode(clickedNode, !clickedNode.isWallNode);
        break;
      default:
        alert(`Invalid clickmode: ${this.props.clickMode}`);
    }
    this.setState({ nodesGrid: [...this.state.nodesGrid] });
  }

  setStartNode(clickedNode) {
    if (this.#startNode) {
      this.#startNode.isStartNode = false;
    }
    clickedNode.isStartNode = true;
    this.#startNode = clickedNode;
  }

  setTargetNode(clickedNode) {
    if (this.#targetNode) {
      this.#targetNode.isTargetNode = false;
    }
    clickedNode.isTargetNode = true;
    this.#targetNode = clickedNode;
  }

  setWallNode(clickedNode, isWallNode) {
    clickedNode.isWallNode = isWallNode;
    if (clickedNode.isWallNode && this.#wallNodes.indexOf(clickedNode) === -1) {
      this.#wallNodes.push(clickedNode);
    } else if (
      !clickedNode.isWallNode &&
      this.#wallNodes.indexOf(clickedNode) !== -1
    ) {
      this.#wallNodes.splice(this.#wallNodes.indexOf(clickedNode), 1);
    }
  }

  getNode(grid, coordinates) {
    return grid[coordinates.Y][coordinates.X];
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
    this.setState({ isPathfindingRunning: false });
    this.initGrid();
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
        <div className="row justify-content-center mb-2">
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
        <div className="container" ref={this.grid}>
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
        isWallNode: false,
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
