// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { ReactNode } from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { Table } from 'reactstrap';
import moment, { Moment } from 'moment-timezone';
import { findOneIana } from "windows-iana";
import { Event } from 'microsoft-graph';
import { config } from './Config';
import { getUserPresence } from './GraphService';
import withAuthProvider, { AuthComponentProps } from './AuthProvider';
import './SeatMap.css';
import 'leaflet/dist/leaflet.css';
import Leaflet from 'leaflet';
import { Circle, ImageOverlay, MapContainer, Marker, Popup, TileLayer, Tooltip } from 'react-leaflet';

import SeatMapImage from "./images/SeatMapImage.jpg"

interface SeatMapState {
  eventsLoaded: boolean;
  events: { [key: string]: string };
}

const rectangle = [
  [51.49, -0.08],
  [51.5, -0.06],
]

const position = [51.505, -0.09]

const blackOptions = { color: 'black' }


class SeatMap extends React.Component<AuthComponentProps, SeatMapState> {
  map: any;
  constructor(props: any) {
    super(props);
    this.state = {
      eventsLoaded: false,
      events: {}
    };
  }

  async componentDidUpdate() {
    if (this.props.user && !this.state.eventsLoaded) {
      try {
        // Get the user's access token
        var accessToken = await this.props.getAccessToken(config.scopes);

        // Get the user's events
        var events = await getUserPresence(accessToken, this.props.user.timeZone);
        this.setState({
          eventsLoaded: true,
          events: events
        })

      }
      catch (err) {
        this.props.setError('ERROR', JSON.stringify(err));
      }
    }
  }

  // <renderSnippet>
  render() {
    const L = require("leaflet");
    // this.map = L.map('map', { crs: L.CRS.Simple });
    // var bounds: [number, number][] = [[0, 399], [643, 0]]; // ここでは画像の解像度をboundsに設定する。
    var bounds: [number, number][] = [[0, 50], [50, 0]]; // ここでは画像の解像度をboundsに設定する。
    // L.imageOverlay('seat.png', bounds).addTo(this.map); // 背景画像を設定する。
    // L.circle([170, 170], { color: 'green', radius: 35 }).addTo(this.map)
    //   .bindTooltip("iwatsuki", { permanent: true, direction: 'center' }).openTooltip()
    //   .bindPopup("iwatsuki <br />IT Support Department");
    // L.circle([170, 290], { color: 'green', radius: 35 }).addTo(this.map)
    //   .bindTooltip("Name A", { permanent: true, direction: 'center' }).openTooltip();
    // L.circle([170, 410], { color: 'green', radius: 35 }).addTo(this.map)
    //   .bindTooltip("Name B", { permanent: true, direction: 'center' }).openTooltip();
    // L.circle([60, 170], { color: 'green', radius: 35 }).addTo(this.map)
    //   .bindTooltip("Name C", { permanent: true, direction: 'center' }).openTooltip();
    // L.circle([60, 290], { color: 'green', radius: 35 }).addTo(this.map)
    //   .bindTooltip("Name D", { permanent: true, direction: 'center' }).openTooltip();
    // L.circle([60, 410], { color: 'gray', radius: 35 }).addTo(this.map)
    //   .bindTooltip("Name E", { permanent: true, direction: 'center' }).openTooltip();
    // this.map.fitBounds(bounds); // 描画領域を設定する。



    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
      iconUrl: require("leaflet/dist/images/marker-icon.png"),
      shadowUrl: require("leaflet/dist/images/marker-shadow.png")
    });

    return (
      <><div>
        <MapContainer center={[25, 25]} zoom={4} scrollWheelZoom={false} style={{ height: "800px", width: "800px" }}>
          {/* <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          /> */}
          {/* <Marker position={[51.505, -0.09]}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
    </Popup>
          </Marker> */}
          <ImageOverlay url="images/SeatMapImage.jpg" bounds={bounds}></ImageOverlay>
          <Circle
            key="test"
            center={[4, 6]}
            fillColor="blue"
            radius={250000} >
            <Tooltip key="test" permanent={true} direction={"center"} >佐藤</Tooltip>
          </Circle>

          <ImageOverlay url="images/SeatMapImage.jpg" bounds={bounds}></ImageOverlay>
          <Circle
            key="test"
            center={[4, 16]}
            fillColor="red"
            pathOptions={{ "color": "red" }}
            radius={250000} >

            <Tooltip key="test" permanent={true} direction={"center"} >田中</Tooltip>
          </Circle>
        </MapContainer>
      </div>
        <div>
          <div>{JSON.stringify(this.state.events["availability"])}</div>
          <div>{JSON.stringify(this.state.events["activity"])}</div>
        </div></>
    );
  }
  // </renderSnippet>
}

export default withAuthProvider(SeatMap);
