import React = require('react');
import {
  Navbar as BSNavbar,
  Button,
  Container,
  Dropdown,
  DropdownButton,
  Spinner,
} from 'react-bootstrap';
import { Icon } from '../components';
import { AuthState } from '../hooks';
import { AppTheme, strings } from '../shared';

interface NavbarProps {
  authState: AuthState;
  theme: AppTheme;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = (props) => {
  return (
    <BSNavbar bg="dark" variant="dark">
      <Container>
        <BSNavbar.Brand href="#">
          {strings.components.navbar.brand}
        </BSNavbar.Brand>
        {!props.authState.initialized || props.authState.loading ? (
          <Spinner animation="border" size="sm" />
        ) : props.authState.authenticated ? (
          <span className="group">
            <Button className="settings" variant="dark" onClick={props.onToggleTheme}>
              <Icon type={props.theme == AppTheme.Light ? 'light' : 'dark'} />
            </Button>
            <DropdownButton
              title={<img src={props.authState.picture} />}
              variant="dark"
              align="end"
            >
              <Dropdown.Item onClick={props.authState.logout}>
                Logout
              </Dropdown.Item>
            </DropdownButton>
          </span>
        ) : (
          <Button variant="success" onClick={props.authState.login}>
            Login
          </Button>
        )}
      </Container>
    </BSNavbar>
  );
};
