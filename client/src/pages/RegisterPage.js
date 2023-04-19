import React, { useState } from 'react';
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button
} from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { postEndpoint } from '../utils/fetchTransform';
import { hashPassword } from '../utils/hash';

export default function RegisterPage(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const navigate = useNavigate();
    const handleSubmit = (e) => {
        e.preventDefault();
        const hashedPassword = hashPassword(email, password);
        postEndpoint('/user/register', {
            email: email,
            password: hashedPassword,
        })
        .then((res) => {
            if (res.error) {
                console.log(res.error);
                return;
            }
            navigate('/login/');
            console.log(res);
        }).catch((err) => {
            console.log(err);
        });
    };

    return (
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
    );
}