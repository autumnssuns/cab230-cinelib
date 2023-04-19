import React, { useState, useContext } from 'react';
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert
} from 'reactstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { postEndpoint } from '../utils/fetchTransform';
import { CacheContext } from '../contexts/CacheContext';
import { hashPassword } from '../utils/hash';

export function MessageFromParams(searchParams){
  // If the RedirectUrl contains /people/data, show a message
  // that the user needs to login to view the data
  const redirectUrl = searchParams.get('redirectUrl') || '/';
  if (redirectUrl.includes('/people/data')) {
    return (
      <Alert color="info">
        This page is only available to members. Please login or <Link to={`/register?redirectUrl=${redirectUrl}`}>register</Link> to view the data.
      </Alert>
    );
  }
  return null;
}

export default function LoginPage(){
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get('redirectUrl') || '/';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { updateUser } = useContext(CacheContext);

    const handleSubmit = (e) => {
      e.preventDefault();
      const hashedPassword = hashPassword(email, password);

      postEndpoint('/user/login', {
          email: email,
          password: hashedPassword,
          longExpiry: false,
      }).then((res) => {
          if (res.error) {
              console.log(res.error);
              return;
          }
          const updates = {loggedIn: true, username: email, ...res};
          updateUser(updates);
          navigate(redirectUrl);
      });
    };
  
    return (
      <div>
      <h1>Login</h1>
      {MessageFromParams(searchParams)}
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
        <Button type="submit" color="primary">Login</Button>
      </Form>
      <p>Don't have an account? <Link to={`/register?redirectUrl=${redirectUrl}`}>Register</Link></p>
      </div>
    );
}