import { useState, useEffect, useReducer } from "react";
import jwt from "jwt-decode";
import { postEndpoint } from "../utils/fetcher";

/**
 * Handles the authentication of the user and interacts with the
 * UserContext.
 * @returns The user object and the updateUser function, along with
 * the modal-related boolean and functions when the refresh token
 * is invalid.
 */
export function useAuth(){
    const [sessionInvalidated, setSessionInvalidated] = useState(false);

    const emptyUser = {
      loggedIn: false,
      username: "",
      bearerToken: {
        token: "",
        token_type: "Bearer",
        expires_in: 0,
      },
      refreshToken: {
        token: "",
        token_type: "Refresh",
        expires_in: 0,
      },
    };
    
    // UseReducer to allow validation of the updates
    const [user, updateUser] = useReducer((current, updates) => {
      // Ensure that the updates only contain valid keys
      const validKeys = Object.keys(current).filter((key) => key in updates);
      const validUpdates = validKeys.reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});
  
      // If loggedIn is set to false, clear the user object
      // and remove the refresh token from local storage
      if (!validUpdates.loggedIn) {
        localStorage.removeItem("refreshToken");
        postEndpoint("/user/logout", {
          refreshToken: current.refreshToken.token,
        });
        return emptyUser;
      }
  
      // If loggedIn set from false to true, save the refresh token
      if (!current.loggedIn && validUpdates.loggedIn) {
        localStorage.setItem("refreshToken", validUpdates.refreshToken.token);
      }
  
      // Return the updated user object
      return {
        ...current,
        ...validUpdates,
      };
    }, emptyUser);
  
    useEffect(() => {
      // Check if the user has a refresh token in local storage
      // If so, attempt to refresh the bearer token
      if (!user.loggedIn && localStorage.getItem("refreshToken")) {
        postEndpoint("/user/refresh", {
          refreshToken: localStorage.getItem("refreshToken"),
        })
          .then((res) => {
            // Decode the bearer token to get the username
            const decoded = jwt(res.bearerToken.token);
            const username = decoded.email;
            updateUser({ loggedIn: true, username, ...res });
          })
          .catch((error) => {
            setSessionInvalidated(true);
          });
      }
    }, []);
    
    // Handle to temporarily hide the message
    const hideMessage = () => {
        setSessionInvalidated(false);
    };

    // Handle to allow the user to cancel logging in
    const cancel = () => {
      setSessionInvalidated(false);
      updateUser({ loggedIn: false });
    };

    return {user, updateUser, sessionInvalidated, hideMessage, cancel};
}