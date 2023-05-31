import React, { useState } from 'react';
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
} from 'reactstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { postEndpoint } from '../../utils/fetcher';
import { Separator } from '../../components/Separator/Separator';
import '../Common.css';

export default function RegisterPage(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get('redirectUrl') || '/';

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== passwordConfirm) {
            setErrorMessage('Passwords do not match');
            setTimeout(() => setErrorMessage(null), 3000);
            return;
        }
        postEndpoint('/user/register', {
            email: email,
            password: password,
        })
        .then((res) => {
            navigate(`/login?redirectUrl=${redirectUrl}&email=${email}`);
        }).catch((err) => {
            setErrorMessage(err.message);
            setTimeout(() => setErrorMessage(null), 3000);
        });
    };

    return (
        <div className='centering-page'>
            <div className='shadow-card shadow-fade-in'>
                <div className='shadow-card-content content-fade-in'>
                    <h1>Register</h1>
                    <Separator direction='horizontal' />
                    {errorMessage && <Alert color="danger">{errorMessage}</Alert>}
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
                        <FormGroup>
                            <Label for="passwordConfirm">Confirm Password</Label>
                            <Input
                                type="password"
                                name="passwordConfirm"
                                id="passwordConfirm"
                                placeholder="Confirm your password"
                                value={passwordConfirm}
                                onChange={(e) => setPasswordConfirm(e.target.value)}
                            />
                        </FormGroup>
                        <Button type="submit" color="primary">Register</Button>
                    </Form>
                </div>
            </div>
        </div>
    );
}