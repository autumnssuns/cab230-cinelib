import "./App.css";
import { useReducer, useState, useEffect } from "react";
import jwt from "jwt-decode";
import Footer from "./components/Footer/Footer";
import NavBar from "./components/NavBar/NavBar";
import HomePage from "./pages/HomePage";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import { CacheContext } from "./contexts/CacheContext";
import RegisterPage from "./pages/RegisterPage";
import MovieDataPage from "./pages/MovieDataPage";
import MoviesPage from "./pages/MoviesPage";
import { postEndpoint } from "./utils/fetchTransform";
import PersonDataPage from "./pages/PersonDataPage";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { PageNotFound } from "./pages/PageNotFound";
import { useAuth } from "./hooks/useAuth";

function App() {
  const {user, updateUser, sessionInvalidated, hideMessage, cancel} = useAuth();
  const location = useLocation();
  const currentUrl = location.pathname;

  return (
    <CacheContext.Provider value={{ user, updateUser }}>
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
        <Modal isOpen={sessionInvalidated} centered={true}>
          <ModalHeader toggle={cancel}>Session Invalidated</ModalHeader>
          <ModalBody>
            Your session has been invalidated. Please log in again to access member
            features.
          </ModalBody>
          <ModalFooter>
            <Link to={`/login?redirectUrl=${currentUrl}`} className="btn btn-primary" onClick={hideMessage}>
              Log In
            </Link>
            <Button color="secondary" onClick={cancel}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </CacheContext.Provider>
  );
}

export default App;
