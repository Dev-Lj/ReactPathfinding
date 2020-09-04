import React from "react";
import Grid from "./pathfinding/GridVisualization/Grid";
import {
  NodeVisual,
  CLICKMODE_START,
  CLICKMODE_TARGET,
} from "./pathfinding/GridVisualization/NodeVisual";
import PathFinder from "./pathfinding/PathFinder/PathFinder";
import "./App.css";

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      nodeClickMode: CLICKMODE_START,
    };
  }

  componentDidMount() {
    alert(
      "This site is WIP. The state of the site does not represent the final state."
    );
  }

  render() {
    return (
      <div>
        <div className="navbar navbar-light bg-light">
          <span className="navbar-brand">PathFinder</span>
        </div>
        <div className="row justify-content-md-center">
          <div className="col-2 justify-content-center">
            <div className="row">
              <NodeVisual className="col-sm" isStartNode={true} />
              <label
                className={
                  "col-sm " +
                  (this.state.nodeClickMode === CLICKMODE_START ? "active" : "")
                }
                onClick={() => {
                  this.setState({ nodeClickMode: CLICKMODE_START });
                }}
              >
                Start Node
              </label>
            </div>
          </div>
          <div className="col-2 justify-content-center">
            <div className="row">
              <NodeVisual className="col-sm" isTargetNode={true} />
              <label
                className={
                  "col-sm " +
                  (this.state.nodeClickMode === CLICKMODE_TARGET
                    ? "active"
                    : "")
                }
                onClick={() => {
                  this.setState({ nodeClickMode: CLICKMODE_TARGET });
                }}
              >
                Target Node
              </label>
            </div>
          </div>
        </div>

        <Grid
          pathFinder={new PathFinder()}
          clickMode={this.state.nodeClickMode}
        />
      </div>
    );
  }
}

export default App;
