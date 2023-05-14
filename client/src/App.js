import "./App.css";
import { useReducer, useState, useEffect } from "react";
import jwt from "jwt-decode";
import Footer from "./components/Footer/Footer";
import NavBar from "./components/NavBar/NavBar";
import HomePage from "./pages/HomePage";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import { UserContext } from "./contexts/UserContext";
import RegisterPage from "./pages/RegisterPage";
import MovieDataPage from "./pages/MovieDataPage";
import MoviesPage from "./pages/MoviesPage";
import { postEndpoint } from "./utils/fetcher";
import PersonDataPage from "./pages/PersonDataPage";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { PageNotFound } from "./pages/PageNotFound";
import { useAuth } from "./hooks/useAuth";

/**
 * The modal to display when the user's session (via refresh token) 
 * has been invalidated.
 * @param {*} isOpen Whether the modal is open.
 * @param {*} toggle The function to toggle the modal.
 * @param {*} cancel The function to cancel the modal.
 * @returns The session modal.
 */
function SessionModal({ isOpen, toggle, cancel }) {
  const location = useLocation();
  const currentUrl = location.pathname;
  
  return (
    <Modal isOpen={isOpen} centered={true}>
      <ModalHeader toggle={cancel}>Session Invalidated</ModalHeader>
      <ModalBody>
        Your session has been invalidated. Please log in again to access member
        features.
      </ModalBody>
      <ModalFooter>
        <Link to={`/login?redirectUrl=${currentUrl}`} className="btn btn-primary" onClick={toggle}>
          Log In
        </Link>
        <Button color="secondary" onClick={cancel}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function App() {
  const {user, updateUser, sessionInvalidated, hideMessage, cancel} = useAuth();

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      <div className="App">
        <NavBar />
        <main className="background-dotted">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/movies/data/:imdbID" element={<MovieDataPage />} />
            <Route path="/people/:id" element={<PersonDataPage />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </main>
        <Footer />
        <SessionModal isOpen={sessionInvalidated} toggle={hideMessage} cancel={cancel} />
      </div>
    </UserContext.Provider>
  );
}

export default App;
