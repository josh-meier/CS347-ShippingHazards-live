
import React, { useState, useEffect } from 'react';
import {useRouter } from 'next/router';
import TextFieldWithError from '../components/TextFieldWithError';

function LoginFields() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [usernameErrorVisible, setUsernameErrorVisible] = useState(false);
    const [passwordErrorVisible, setPasswordErrorVisible] = useState(false);

    const [backendErrorVisible, setBackendErrorVisible] = useState(false);
    const [backendErrorText, setBackendErrorText] = useState('');

    const router = useRouter();

    function getCookie(name: string): string | null {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function attemptLogin(the_json: any) {
        setUsernameErrorVisible(false);
        setPasswordErrorVisible(false);
        setBackendErrorVisible(false);
        let success = the_json["status"] === "success";
        let message = the_json["message"];
        if (success) {
            router.push(`/home`);
        } else {
            setBackendErrorText(message);
            setBackendErrorVisible(true);
        }
    }

    const onSubmitButtonClick = async () => {
        if (username.length === 0 || password.length === 0) {
            setUsernameErrorVisible(username.length === 0);
            setPasswordErrorVisible(password.length === 0);
        } else {
            try {
                // First, get the CSRF token
                await fetch('/accounts/csrf/');
                const csrfToken = getCookie('csrftoken');

                // Then, make the login request
                const response = await fetch('/accounts/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken || '',
                    },
                    body: JSON.stringify({ username, password }),
                });

                const the_json = await response.json();
                attemptLogin(the_json);
            } catch (error) {
                console.error('Error during login:', error);
                setBackendErrorText('An unexpected error occurred. Please try again.');
                setBackendErrorVisible(true);
            }
        }
    }

    const guestLogin = async () => {
        try {
            await fetch('/accounts/csrf/');
            const csrfToken = getCookie('csrftoken');
            const resp = await fetch('/accounts/guest_login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken || '',
                },
                body: JSON.stringify({}),
            });
            const json = await resp.json();
            if (json.status === 'success') {
                router.push('/home');
            } else {
                setBackendErrorText('Unable to start guest session.');
                setBackendErrorVisible(true);
            }
        } catch (e) {
            console.error('Guest login failed:', e);
            setBackendErrorText('Unable to start guest session.');
            setBackendErrorVisible(true);
        }
    };

    return (
        <div>
            <TextFieldWithError placeholder={"Username"} value={username} setValue={setUsername} errorVisible={usernameErrorVisible} />
            <TextFieldWithError password={true} placeholder={"Password"} value={password} setValue={setPassword} errorVisible={passwordErrorVisible} />
            <label className="errorLabel" style={{ display: backendErrorVisible ? "block" : "none" }}>{backendErrorText}</label>
            <div className="loginButtons">
                <input id="loginButton" className="inputButton btn-guest" type="button" onClick={onSubmitButtonClick} value={'Login'} />
                <div className="hintText">Don’t have an account yet?</div>
                <input className="inputButton btn-guest" type="button" onClick={guestLogin} value={'Login as guest'} />
                <div className="login-divider"><span>or</span></div>
                <input className="inputButton btn-guest" type="button" onClick={() => router.push(`/create-account?fillerUsername=${username}`)} value={'Create an account'} />
            </div>
        </div>
    );
}

export default function Login() {
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Enter") {
                event.preventDefault();
                (document.getElementById("loginButton") as HTMLInputElement).click();
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className="mainContainer">
            <div className='loginContainer'>
                <div className="gametitle">
                    <div>SHIPPING HAZARDS</div>
                </div>
                <div className="titleContainer">Log in</div>
                <LoginFields />
            </div>
        </div>
    )
}
