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

  render() {
    return (
      <div>
        <div className="navbar navbar-light bg-light">
          <span className="navbar-brand">PathFinder</span>
        </div>
        <div className="row justify-content-center">
          <div className="col-md-2 justify-content-center">
            <div className="form-check">
              <div className="form-check-input">
                <NodeVisual isStartNode={true} />
              </div>
              <label
                className={
                  "form-check-label " +
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
          <div className="col-md-2 justify-content-center">
            <div className="form-check">
              <div className="form-check-input">
                <NodeVisual isTargetNode={true} />
              </div>
              <label
                className={
                  "form-check-label " +
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
