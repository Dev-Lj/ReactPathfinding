import React from "react";
import Grid from "./pathfinding/GridVisualization/Grid";
import PathFinder from "./pathfinding/PathFinder/PathFinder";
import "./App.css";

class App extends React.Component {
  render() {
    return (
      <div>
        <div className="navbar navbar-light bg-light">
          <span className="navbar-brand">PathFinder</span>
        </div>
        <Grid pathFinder={new PathFinder()} />
      </div>
    );
  }
}

export default App;
