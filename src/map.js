// @flow
import React from "react";
import { Map, ImageOverlay, Marker, Popup, LayersControl } from "react-leaflet";
import Leaflet from "leaflet";
import R from "ramda";
import Config from "./config";
import { Actions } from "./state";
import { keyOf } from "./util";
import { store } from "./state";

import ReactDOM from "react-dom";

// convert width/height coordinates to -height/width coordinates
const c = (p) => [-p[1], p[0]]

const color = (iconColor, state: State) => {
  // TODO: give iconColor not only internal but also actual values
  return iconColor == null ? "#000000" :
    iconColor(
      R.map(x => x.internal == null ?
        x.actual : x.internal, state.values == null ? {} : state.values)
    );
}
const iconHtml = (el, state: State) =>
  "<i class=\"material-icons\" style=\""
    + "color:" + color(el.iconColor, state) + ";\">"
    + el.icon + "</i>"

const Markers = (props) => R.values(R.mapObjIndexed((el,key) => (
  <Marker position={c(el.position)} key={el.name}
    icon={Leaflet.divIcon(
      {
        html: iconHtml(el, props.state),
        iconSize: Leaflet.point(32,32),
        iconAnchor: Leaflet.point(16,16)
      })}
    onClick={(e) => store.dispatch({type: Actions.CHANGE_UI, payload: key, toggle: e.originalEvent.ctrlKey})}>
  </Marker>
), R.propOr({}, "controls", Config)));

class SpaceMap extends React.Component<{state: State, width: number, height: number,
    zoom: number, image: string}> {

  constructor(props) {
    super(props);
  }

  render() {
    const props = this.props;
    return (
      <Map center={c([props.width / 2, props.height / 2])} zoom={props.zoom}
          crs={Leaflet.CRS.Simple}> 
        {Markers(props)}
        <LayersControl position='topright'>
          {Config.layers.map(x => this.renderLayer(x, [c([0,0]), c([props.width, props.height])]))}
        </LayersControl>
      </Map>
    );
  }

  renderLayer(layer, bounds) {
    const LayersControlType = layer.baseLayer ? LayersControl.BaseLayer : LayersControl.Overlay;
    return (
      <LayersControlType name={layer.name}
            checked={layer.defaultVisibility == "visible"}>
        <ImageOverlay url={layer.image} bounds={bounds} />
      </LayersControlType>
    );
  }
}

export default SpaceMap;
