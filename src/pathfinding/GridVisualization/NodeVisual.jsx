import React from "react";
import "./NodeVisual.css";

export const CLICKMODE = {
  START: "start",
  TARGET: "target",
  WALL: "wall",
};

export const NODEMODE = {
  NONE: "",
  START: "start",
  TARGET: "target",
  WALL: "wall",
  WAY: "way",
  VISITED: "visited",
};

export class NodeVisual extends React.Component {
  getCoordinates() {
    return this.props.coordinates;
  }

  render() {
    return (
      <div
        className={"node border " + this.props.mode}
        onClick={() => {
          if (this.props.nodeClicked) {
            this.props.nodeClicked(this);
          }
        }}
        onMouseOver={(e) => {
          if (e.buttons === 1) {
            this.props.nodeClicked(this);
          }
        }}
      ></div>
    );
  }
}

export default NodeVisual;
