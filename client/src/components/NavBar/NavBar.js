import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { IndexedDB } from "../../utils/indexed";
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
import "./NavBar.css"

function LoginSection(currentUrl){
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

function LogoutSection(username, onLogout, to){
    return (
        <Nav navbar>
              <NavbarText style={{margin: "auto"}}>
                  Logged in as <b>{username}</b>
              </NavbarText>
            <NavItem>
              <NavLink tag={Link} onClick={onLogout} to={to}>
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
    const location = useLocation();
    const currentUrl = location.pathname;
    
    const logoutTarget = currentUrl.includes("/people/") ? "/" : currentUrl;
    const onLogout = () => {
      updateUser({loggedIn: false})
      if (IndexedDB.IsSupported) {
        IndexedDB.People.clear();
      }
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
                user.loggedIn ? LogoutSection(user.username, onLogout, logoutTarget) : LoginSection(currentUrl)
            }
          </Collapse>
        </Navbar>
      </div>
    )
}