// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// <NavBarSnippet>
import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import {
  Button,
  Collapse,
  Container,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import '@fortawesome/fontawesome-free/css/all.css';
import { Person } from '@microsoft/mgt-react';

interface NavBarProps {
  isAuthenticated: boolean;
  authButtonMethod: any;
  user: any;
}

interface NavBarState {
  isOpen: boolean;
}

function UserAvatar(props: any) {
  // If a user avatar is available, return an img tag with the pic
  // if (props.user.avatar) {
  //   return <img
  //     src={props.user.avatar} alt="user"
  //     className="rounded-circle align-self-center mr-2"
  //     style={{ width: '32px' }}></img>;
  // }

  return (<Person person-query="me" />)
  // No avatar available, return a default icon
  return <i
    className="far fa-user-circle fa-lg rounded-circle align-self-center mr-2"
    style={{ width: '32px' }}></i>;
}

function AuthNavItem(props: NavBarProps) {
  // If authenticated, return a dropdown with the user's info and a
  // sign out button
  if (props.isAuthenticated) {
    return (
      <UncontrolledDropdown>
        <DropdownToggle nav caret>
          <UserAvatar user={props.user} />
        </DropdownToggle>
        <DropdownMenu right>
          <h5 className="dropdown-item-text mb-0">{props.user.displayName}</h5>
          <p className="dropdown-item-text text-muted mb-0">{props.user.email}</p>
          <DropdownItem divider />
          <DropdownItem onClick={props.authButtonMethod}>Sign Out</DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }

  // Not authenticated, return a sign in link
  return (
    <NavItem>
      <Button
        onClick={props.authButtonMethod}
        className="btn-link nav-link border-0"
        color="link">Sign In</Button>
    </NavItem>
  );
}

export default class NavBar extends React.Component<NavBarProps, NavBarState> {
  constructor(props: NavBarProps) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false
    };
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  render() {
    // Only show calendar nav item if logged in
    let calendarLink = null;
    let seatMapLink = null;
    if (this.props.isAuthenticated) {
      calendarLink = (
        <NavItem>
          <RouterNavLink to="/calendar" className="nav-link" exact>Calendar</RouterNavLink>
        </NavItem>
      );
      seatMapLink = (
        <NavItem>
          <RouterNavLink to="/seatmap" className="nav-link" exact>SeatMap</RouterNavLink>
        </NavItem>
      );
    }

    return (
      <div>
        <Navbar color="dark" dark expand="md" fixed="top">
          <Container>
            <NavbarBrand href="/"></NavbarBrand>
            <NavbarToggler onClick={this.toggle} />
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className="mr-auto" navbar>
                <NavItem>
                  <RouterNavLink to="/" className="nav-link" exact>Home</RouterNavLink>
                </NavItem>
                {seatMapLink}
                {calendarLink}
              </Nav>
              <Nav className="justify-content-end" navbar>
                <AuthNavItem
                  isAuthenticated={this.props.isAuthenticated}
                  authButtonMethod={this.props.authButtonMethod}
                  user={this.props.user} />
              </Nav>
            </Collapse>
          </Container>
        </Navbar>
      </div>
    );
  }
}
// </NavBarSnippet>
