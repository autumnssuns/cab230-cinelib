import React, { useState, useContext, useEffect } from "react";
import { Form, FormGroup, Label, Input, Button, Alert } from "reactstrap";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { postEndpoint } from "../../utils/fetcher";
import { UserContext } from "../../contexts/UserContext";
import { Separator } from "../../components/Separator/Separator";

/**
 * Creates a message to display to the user based on the
 * redirectUrl parameter in the URL.
 * @param {*} searchParams The URLSearchParams object.
 * @returns The message to display to the user.
 */
export function MessageFromParams(searchParams) {
  // If the RedirectUrl contains /people/data, show a message
  // that the user needs to login to view the data
  const redirectUrl = searchParams.get("redirectUrl") || "/";
  if (redirectUrl.includes("/people/")) {
    return (
      <Alert color="info">
        This page is only available to members. Please login or&nbsp;
        <Link to={`/register?redirectUrl=${redirectUrl}`}>register</Link> to
        view the data.
      </Alert>
    );
  }
  return null;
}

/**
 * Creates an error message to display to the user.
 * @param {*} message The error message to display.
 * @returns The error message to display to the user.
 */
export function ErrorMessage(message) {
  return <Alert color="danger">{message}</Alert>;
}

/**
 * The login page.
 * @returns The login page.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirectUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessages, setErrorMessages] = useState(null);
  const { updateUser } = useContext(UserContext);

  // If an email is passed in the URL, pre-populate the email field
  useEffect(() => {
    const email = searchParams.get("email");
    if (email) {
      setEmail(email);
    }
  }, [searchParams]);

  /**
   * Handles the submission of the login form.
   * @param {*} e The event that triggered the submission.
   * @returns The result of the submission.
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    postEndpoint("/user/login", {
      email: email,
      password: password,
      longExpiry: false,
    })
      .then((res) => {
        // Update the user context and redirect to the redirectUrl
        updateUser({ loggedIn: true, username: email, ...res });
        navigate(redirectUrl);
      })
      .catch((error) => {
        console.log(error);
        setErrorMessages(error.message);
      });
  };

  return (
    <div className="centering-page">
      <div className="shadow-card shadow-fade-in">
        <div className="shadow-card-content content-fade-in">
          <h1>Login</h1>
          <Separator direction="horizontal" />
          {MessageFromParams(searchParams)}
          {errorMessages ? ErrorMessage(errorMessages) : null}
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label for="email">Email</Label>
              <Input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label for="password">Password</Label>
              <Input
                type="password"
                name="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormGroup>
            <Button type="submit" color="primary">
              Login
            </Button>
          </Form>
          <p>
            Don't have an account?{" "}
            <Link to={`/register?redirectUrl=${redirectUrl}`}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
