import './App.css';
import { useReducer } from 'react';
import Footer from './components/Footer/Footer';
import NavBar from './components/NavBar/NavBar';
import HomePage from './pages/HomePage';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import { CacheContext } from './contexts/CacheContext';
import RegisterPage from './pages/RegisterPage';

function App() {
  console.log("App Rendered")

  const emptyUser = {
    loggedIn: false,
    username: '',
    bearerToken: {
      token: '',
      token_type: "Bearer",
      expires_in: 0,
    },
    refreshToken: {
      token: '',
      token_type: "Refresh",
      expires_in: 0,
    }
  };
  // UseReducer to allow validated updates to user
  const [user, updateUser] = useReducer((current, updates) =>
  {
    // Ensure that the updates only contain valid keys
    const validKeys = Object.keys(current).filter(key => key in updates);
    const validUpdates = validKeys.reduce((obj, key) => {
      obj[key] = updates[key];
      return obj;
    }, {});

    // If loggedIn set from true to false, clear the user object
    // and remove the refresh token from local storage
    if (current.loggedIn && !validUpdates.loggedIn) {
      localStorage.removeItem('refreshToken');
      return emptyUser;
    }
    
    // If loggedIn set from false to true, save the refresh token
    if (!current.loggedIn && validUpdates.loggedIn) {
      localStorage.setItem('refreshToken', validUpdates.refreshToken.token);
    }

    // Return the updated user object
    return {
      ...current,
      ...validUpdates,
    };
  } , emptyUser);

  return (
    <CacheContext.Provider value={{user, updateUser}}>
      <div className="App">
        <NavBar/>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage/>} />
            <Route path="/register" element={<RegisterPage/>} />
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </main>
        <Footer/>
      </div>
    </CacheContext.Provider>
  );
}

export default App;