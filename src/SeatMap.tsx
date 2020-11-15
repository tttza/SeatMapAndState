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

interface SeatMapState {
  eventsLoaded: boolean;
  events: { [key: string]: string };
}

class SeatMap extends React.Component<AuthComponentProps, SeatMapState> {
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
    return (
      <div>
        <div>{JSON.stringify(this.state.events["availability"])}</div>
        <div>{JSON.stringify(this.state.events["activity"])}</div>
      </div>
    );
  }
  // </renderSnippet>
}

export default withAuthProvider(SeatMap);
