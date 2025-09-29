// Header component

import React from "react";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../constants";

const Header: React.FC = () => {
  const { state, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.HOME);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Navbar
      bg="success"
      variant="dark"
      expand="lg"
      sticky="top"
      className="w-100"
    >
      <div className="container-fluid">
        <Navbar.Brand as={Link} to={ROUTES.HOME} className="fw-bold fs-3">
          EasyRide
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {state.isAuthenticated ? (
              <NavDropdown
                title={state.user?.name || "User"}
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to={ROUTES.PROFILE}>
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to={ROUTES.SETTINGS}>
                  Settings
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to={ROUTES.LOGIN}>
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to={ROUTES.REGISTER}>
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
};

export default Header;
