import React from "react";
import "./NodeVisual.css";

export const CLICKMODE_START = "start";
export const CLICKMODE_TARGET = "target";

export class NodeVisual extends React.Component {
  getCoordinates() {
    return this.props.coordinates;
  }

  render() {
    let conditionalNodeStyle = "";
    if (this.props.isTargetNode) {
      conditionalNodeStyle = "target";
    } else if (this.props.isStartNode) {
      conditionalNodeStyle = "start";
    } else if (this.props.isWay) {
      conditionalNodeStyle = "way";
    } else if (this.props.isVisited) {
      conditionalNodeStyle = "visited";
    }
    return (
      <div
        className={"node border " + conditionalNodeStyle}
        onClick={() => {
          if (this.props.nodeClicked) {
            this.props.nodeClicked(this);
          }
        }}
      ></div>
    );
  }
}

export default NodeVisual;
