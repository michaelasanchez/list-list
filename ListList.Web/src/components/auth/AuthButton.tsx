import React = require('react');
import { Nav, NavDropdown } from 'react-bootstrap';
import Spinner from 'react-bootstrap/esm/Spinner';
import { useAuthState } from '../../hooks';
import { strings } from '../../shared';

interface AuthButtonProps {
  authState: useAuthState;
}

const AuthButton: React.FC<AuthButtonProps> = (props) => {
  return (
    <>
      {props.authState.loading ? (
        // <div className="spinner-container">
        <Spinner animation="border" size="sm" variant="secondary" />
      ) : (
        // </div>
        <>
          {!!props.authState.user ? (
            <NavDropdown
              title={props.authState.user.username}
              id="navbar-dropdown"
              align="end"
            >
              <NavDropdown.Item onClick={() => props.authState.signOut()}>
                {strings.components.auth.button.signOutButtonLabel}
              </NavDropdown.Item>
            </NavDropdown>
          ) : (
            <Nav.Item>
              <Nav.Link onClick={() => props.authState.signIn()}>
                {strings.components.auth.button.signInButtonLabel}
              </Nav.Link>
            </Nav.Item>
          )}
        </>
      )}
    </>
  );
};

export const MemoizedAuthButton = React.memo(AuthButton);