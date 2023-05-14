import React, { useState, useContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
  NavbarText,
} from "reactstrap";
import { UserContext } from "../../contexts/UserContext";
import "./NavBar.css";

/**
 * Creates the Login section of the navbar, including
 * the Login and Register buttons.
 * @param {*} currentUrl The current URL of the page.
 * @returns The Login section of the navbar.
 */
function LoginSection(currentUrl) {
  return (
    <Nav navbar>
      <NavItem>
        <NavLink tag={Link} to={`/login/?redirectUrl=${currentUrl}`}>
          <Button color="primary" outline>
            Login
          </Button>
        </NavLink>
      </NavItem>
      <NavItem>
        <NavLink tag={Link} to="/register/">
          <Button color="primary">Register</Button>
        </NavLink>
      </NavItem>
    </Nav>
  );
}

/**
 * The Logout section of the navbar, including the
 * email and the Logout button.
 * @param {*} email The email of the user.
 * @param {*} onLogout The function to call when the user clicks the Logout button.
 * @param {*} to The URL to redirect to after logging out.
 * @returns The Logout section of the navbar.
 */
function LogoutSection(email, onLogout, to) {
  return (
    <Nav navbar>
      <NavbarText style={{ margin: "auto" }}>
        Logged in as <b>{email}</b>
      </NavbarText>
      <NavItem>
        <NavLink tag={Link} onClick={onLogout} to={to}>
          <Button color="primary" outline>
            Logout
          </Button>
        </NavLink>
      </NavItem>
    </Nav>
  );
}

/**
 * Debounce function to prevent too many calls to handleScroll,
 * when the user is scrolling up or down.
 * @param {*} func The function to debounce.
 * @param {*} wait The wait time in milliseconds.
 * @param {*} immediate Whether to call the function immediately.
 * @returns The debounced function.
 */
function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

/**
 * The navbar component with the site home link, the movies page link,
 * and the login and register buttons, or the user email and logout button.
 * @returns The navbar component.
 */
export default function NavBar() {
  const { user, updateUser } = useContext(UserContext);
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const location = useLocation();
  const currentUrl = location.pathname;

  // If currently on the protected people page, redirect to home page after logout
  // Otherwise, redirect to current page after logout
  const logoutTarget = currentUrl.includes("/people/") ? "/" : currentUrl;
  const onLogout = () => {
    updateUser({ loggedIn: false });
    // Also remove all people from IndexedDB
    if (IndexedDB.IsSupported) {
      IndexedDB.People.clear();
    }
  };

  // Detect scroll to hide or show navbar
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [show, setShow] = useState(true);
  const handleScroll = debounce(() => {
    const currentScrollPos = window.pageYOffset;
    const scrollingUp = prevScrollPos > currentScrollPos;
    const scrollDistance = prevScrollPos - currentScrollPos;
    const atTop = currentScrollPos < 10;
    const showNav = (scrollingUp && scrollDistance > 70) || atTop;
    setShow(showNav);
    setPrevScrollPos(currentScrollPos);
  }, 100);

  // Update the scroll event listener when the user scrolls,
  // when the show state changes, or when the handleScroll function changes
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos, show, handleScroll]);

  return (
    <div id="top-nav-bar" className={show ? "" : "hidden"}>
      <Navbar dark expand="md" fixed="top">
        <NavbarBrand tag={Link} to="/">
          Cine<span className="title-emphasised">Lib</span>
        </NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="me-auto" navbar>
            <NavItem>
              <NavLink tag={Link} to="/">
                Home
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/movies/">
                Movies
              </NavLink>
            </NavItem>
          </Nav>
          {user.loggedIn
            ? LogoutSection(user.username, onLogout, logoutTarget)
            : LoginSection(currentUrl)}
        </Collapse>
      </Navbar>
    </div>
  );
}