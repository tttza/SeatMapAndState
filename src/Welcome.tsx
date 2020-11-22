// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Login } from '@microsoft/mgt-react';
// <WelcomeSnippet>
import React from 'react';
import {
  Button,
  Jumbotron
} from 'reactstrap';

interface WelcomeProps {
  isAuthenticated: boolean;
  authButtonMethod: any;
  user: any;
}

interface WelcomeState {
  isOpen: boolean;
}

function WelcomeContent(props: WelcomeProps) {
  if (props.isAuthenticated) {
    return (
      <div>
        <h4>Welcome {props.user.displayName}!</h4>
        <p>Use the navigation bar at the top of the page to get started.</p>
      </div>
    );
  }

  return (null);
}

export default class Welcome extends React.Component<WelcomeProps, WelcomeState> {
  render() {
    return (
      <><Jumbotron>
        <h1>WAS</h1>
        <h4>Working Assistant System for the better life.</h4>
        <p className="lead">
        </p>
        <WelcomeContent
          isAuthenticated={this.props.isAuthenticated}
          user={this.props.user}
          authButtonMethod={this.props.authButtonMethod} />
      </Jumbotron>
        <Login />  </>
    );
  }
}
// </WelcomeSnippet>
