import { NodeVisual, CLICKMODE, NODEMODE } from "./NodeVisual";
import Node from "../PathFinder/Node";
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
      nodeClickMode: CLICKMODE.START,
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

  /**
   * Init Grid AFTER resize happened
   */
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

  nodeClicked(node) {
    if (this.state.isPathfindingRunning) {
      return;
    }

    let clickedNode = this.getNode(this.state.nodesGrid, node.getCoordinates());

    switch (this.state.nodeClickMode) {
      case CLICKMODE.START:
        this.setStartNode(clickedNode);
        this.setState({ nodeClickMode: CLICKMODE.TARGET });
        break;
      case CLICKMODE.TARGET:
        this.setTargetNode(clickedNode);
        this.setState({ nodeClickMode: CLICKMODE.WALL });
        break;
      case CLICKMODE.WALL:
        this.setWallNode(clickedNode, !clickedNode.isWallNode);
        break;
      default:
        alert(`Invalid clickmode: ${this.state.nodeClickMode}`);
    }
    this.setState({ nodesGrid: [...this.state.nodesGrid] });
  }

  setStartNode(clickedNode) {
    if (this.#startNode) {
      this.#startNode.mode = NODEMODE.NONE;
    }
    clickedNode.mode = NODEMODE.START;
    this.#startNode = clickedNode;
  }

  setTargetNode(clickedNode) {
    if (this.#targetNode) {
      this.#targetNode.mode = NODEMODE.NONE;
    }
    clickedNode.mode = NODEMODE.TARGET;
    this.#targetNode = clickedNode;
  }

  setWallNode(clickedNode, isWallNode) {
    clickedNode.mode = isWallNode ? NODEMODE.WALL : NODEMODE.NONE;
    if (isWallNode && this.#wallNodes.indexOf(clickedNode) === -1) {
      this.#wallNodes.push(clickedNode);
    } else if (!isWallNode && this.#wallNodes.indexOf(clickedNode) !== -1) {
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
    this.props.pathFinder.init(this.visualGridToNodesGrid());
    let { visitedNodes, shortestPath } = this.props.pathFinder.doPathFinding();
    await this.visualizePathFinding(visitedNodes);
    await this.visualizeShortestPath(shortestPath);
    await sleep(1000);
    this.setState({ isPathfindingRunning: false });
    this.initGrid();
  }

  /**
   * Convert visual node objects to node objects for pathfinder to use
   */
  visualGridToNodesGrid() {
    var nodesGrid = [];
    for (let [y, row] of this.state.nodesGrid.entries()) {
      nodesGrid.push([]);
      for (let visualNode of row) {
        let node = new Node(visualNode.coordinates.X, visualNode.coordinates.Y);
        if (visualNode.mode !== NODEMODE.NONE) {
          switch (visualNode.mode) {
            case NODEMODE.START:
              node.setDistanceToStartNode(0);
              break;
            case NODEMODE.TARGET:
              node.setTargetNode();
              break;
            case NODEMODE.WALL:
              node.setIsWall();
              break;
            default:
              console.error(`Unknown NODEMODE: ${visualNode.mode}`);
          }
        }
        nodesGrid[y].push(node);
      }
    }
    return nodesGrid;
  }

  async visualizePathFinding(visitedNodes) {
    for (const node of visitedNodes) {
      this.setState((state) => {
        const nodesGrid = [...state.nodesGrid];
        let visualNode = nodesGrid[node.getYPos()][node.getXPos()];
        if (visualNode.mode === NODEMODE.NONE)
          visualNode.mode = NODEMODE.VISITED;
        return nodesGrid;
      });
      await sleep(10);
    }
  }

  async visualizeShortestPath(shortestPath) {
    for (const node of shortestPath) {
      this.setState((state) => {
        const nodesGrid = [...state.nodesGrid];
        let visualNode = nodesGrid[node.getYPos()][node.getXPos()];
        if (visualNode.mode === NODEMODE.VISITED)
          visualNode.mode = NODEMODE.WAY;
        return nodesGrid;
      });
      await sleep(10);
    }
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
                mode={node.mode}
                nodeClicked={this.nodeClicked}
              />
            );
          })}
        </div>
      );
    });
  }

  render() {
    return (
      <div className="container-fluid justify-content-center mt-2">
        <div className="row justify-content-center">
          <div className="col-md-2 justify-content-center">
            <div className="form-check">
              <div className="form-check-input">
                <NodeVisual mode={NODEMODE.START} />
              </div>
              <label
                className={
                  "form-check-label " +
                  (this.state.nodeClickMode === CLICKMODE.START ? "active" : "")
                }
                onClick={() => {
                  this.setState({ nodeClickMode: CLICKMODE.START });
                }}
              >
                Start Node
              </label>
            </div>
          </div>
          <div className="col-md-2 justify-content-center">
            <div className="form-check">
              <div className="form-check-input">
                <NodeVisual mode={NODEMODE.TARGET} />
              </div>
              <label
                className={
                  "form-check-label " +
                  (this.state.nodeClickMode === CLICKMODE.TARGET
                    ? "active"
                    : "")
                }
                onClick={() => {
                  this.setState({ nodeClickMode: CLICKMODE.TARGET });
                }}
              >
                Target Node
              </label>
            </div>
          </div>
          <div className="col-md-2 justify-content-center">
            <div className="form-check">
              <div className="form-check-input">
                <NodeVisual mode={NODEMODE.WALL} />
              </div>
              <label
                className={
                  "form-check-label " +
                  (this.state.nodeClickMode === CLICKMODE.WALL ? "active" : "")
                }
                onClick={() => {
                  this.setState({ nodeClickMode: CLICKMODE.WALL });
                }}
              >
                Wall Node
              </label>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mt-2 mb-2">
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
        mode: NODEMODE.NONE,
      };
    }
  }
  return nodesGrid;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default Grid;
