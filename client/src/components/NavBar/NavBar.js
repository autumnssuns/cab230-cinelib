import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import "./NavBar.css"
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  NavbarText,
} from 'reactstrap';
import { CacheContext } from '../../contexts/CacheContext';

function LoginSection(){
    const location = useLocation();
    const currentUrl = location.pathname;

    return (
        <Nav navbar>
            <NavItem>
                <NavLink tag={Link} to={`/login/?redirectUrl=${currentUrl}`}>
                    <Button
                        color="primary"
                        outline
                    >
                        Login
                    </Button>
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink tag={Link} to="/register/">
                    <Button
                        color="primary"
                    >
                    Register
                    </Button>
                </NavLink>
            </NavItem>
        </Nav>
    )
}

function LogoutSection(username, onLogout){
    return (
        <Nav navbar>
              <NavbarText style={{margin: "auto"}}>
                  Logged in as <b>{username}</b>
              </NavbarText>
            <NavItem>
              <NavLink tag={Link} onClick={onLogout}>
                <Button
                    color="primary"
                    outline
                >
                    Logout
                </Button>
              </NavLink>
            </NavItem>
        </Nav>
    )
}

export default function NavBar(){
    const { user, updateUser } = useContext(CacheContext);
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);

    const onLogout = () => {
      updateUser({loggedIn: false})
    }

    return (
        <div>
        <Navbar dark expand="md">
          <NavbarBrand tag={Link} to="/">Home</NavbarBrand>
          <NavbarToggler onClick={toggle} />
          <Collapse isOpen={isOpen} navbar>
            <Nav className="me-auto" navbar>
              <NavItem>
                <NavLink tag={Link} to="/movies/">
                    Movies
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to="/actors/">
                  Actors
                </NavLink>
              </NavItem>
            </Nav>
            {
                user.loggedIn ? LogoutSection(user.username, onLogout) : LoginSection()
            }
          </Collapse>
        </Navbar>
      </div>
    )
}