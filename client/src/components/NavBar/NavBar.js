import React, { useState } from 'react';
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

export default function NavBar(){
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);
    return (
        <div>
        <Navbar dark expand="md">
          <NavbarBrand href="/">Home</NavbarBrand>
          <NavbarToggler onClick={toggle} />
          <Collapse isOpen={isOpen} navbar>
            <Nav className="me-auto" navbar>
              <NavItem>
                <NavLink href="/movies/">
                    Movies
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="/actors/">
                  Actors
                </NavLink>
              </NavItem>
            </Nav>
            <Nav navbar>
                <NavItem>
                    <NavLink href="/login/">
                        <Button
                            color="primary"
                            outline
                        >
                            Login
                        </Button>
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink href="/register/">
                        <Button
                                color="primary"
                            >
                            Register
                        </Button>
                    </NavLink>
                </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    )
}