import React = require('react');
import {
  Navbar as BSNavbar,
  Button,
  Container,
  Spinner,
} from 'react-bootstrap';
import { AuthState } from '../hooks';
import { strings } from '../shared';

interface NavbarProps {
  authState?: AuthState;
}

export const Navbar: React.FC<NavbarProps> = (props) => {
  return (
    <BSNavbar bg="dark" variant="dark">
      <Container>
        <BSNavbar.Brand href="#">
          {strings.components.navbar.brand}
        </BSNavbar.Brand>
        {!props.authState.initialized || props.authState.loading ? (
          <Spinner animation="border" />
        ) : props.authState.authenticated ? (
          <Button variant="dark" onClick={props.authState.logout}>
            Logout
          </Button>
        ) : (
          <Button variant="success" onClick={props.authState.login}>
            Login
          </Button>
        )}
      </Container>
    </BSNavbar>
  );
};
