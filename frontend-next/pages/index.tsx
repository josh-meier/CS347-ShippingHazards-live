
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

    function attemptLogin(the_json: any) {
        setUsernameErrorVisible(false);
        setPasswordErrorVisible(false);
        setBackendErrorVisible(false);
        let success = the_json["status"] === "success";
        let message = the_json["message"];
        if (success) {
            router.push(`/home?username=${username}`);
        } else {
            setBackendErrorText(message);
            setBackendErrorVisible(true);
        }
    }

    const onSubmitButtonClick = () => {
        if (username.length === 0 || password.length === 0) {
            setUsernameErrorVisible(username.length === 0);
            setPasswordErrorVisible(password.length === 0);
        } else {
            let url = `/accounts/react_login/${username}/${password}`;
            fetch(url)
                .then(response => response.json())
                .then(the_json => attemptLogin(the_json))
                .catch(error => console.error('Error fetching login:', error));
        }
    }

    return (
        <div>
            <TextFieldWithError placeholder={"Username"} value={username} setValue={setUsername} errorVisible={usernameErrorVisible} />
            <TextFieldWithError password={true} placeholder={"Password"} value={password} setValue={setPassword} errorVisible={passwordErrorVisible} />
            <label className="errorLabel" style={{ display: backendErrorVisible ? "block" : "none" }}>{backendErrorText}</label>
            <div className="inputContainer">
                <input id="loginButton" className="inputButton" type="button" onClick={onSubmitButtonClick} value={'Submit'} />
                <input className="inputButton" type="button" onClick={() => router.push(`/create-account?fillerUsername=${username}`)} value={'Create Account'} />
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
                    <div>BATTLESHIP</div>
                </div>
                <div className="titleContainer">Login</div>
                <LoginFields />
            </div>
        </div>
    )
}
