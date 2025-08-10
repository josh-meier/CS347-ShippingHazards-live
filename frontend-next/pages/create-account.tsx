
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TextFieldWithError from '../components/TextFieldWithError';

function AccountCreationFields() {
    const router = useRouter();
    const { fillerUsername } = router.query;

    const [username, setUsername] = useState(fillerUsername || '');
    const [password, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');
    const [screenName, setScreenName] = useState('');

    const [usernameErrorVisible, setUsernameErrorVisible] = useState(false);
    const [password1ErrorVisible, setPassword1ErrorVisible] = useState(false);
    const [password2ErrorVisible, setPassword2ErrorVisible] = useState(false);
    const [screenNameErrorVisible, setScreenNameErrorVisible] = useState(false);

    const [backendErrorVisible, setBackendErrorVisible] = useState(false);
    const [backendErrorText, setBackendErrorText] = useState('');

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

    function attemptCreation(the_json: any) {
        setUsernameErrorVisible(false);
        setPassword1ErrorVisible(false);
        setPassword2ErrorVisible(false);
        setScreenNameErrorVisible(false);
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
        if (username.length === 0 || password.length === 0 || password2.length === 0 || screenName.length === 0) {
            setUsernameErrorVisible(username.length === 0);
            setPassword1ErrorVisible(password.length === 0);
            setPassword2ErrorVisible(password2.length === 0);
            setScreenNameErrorVisible(screenName.length === 0);
        } else {
            try {
                await fetch('/accounts/csrf/');
                const csrfToken = getCookie('csrftoken');

                const response = await fetch('/accounts/signup/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken || '',
                    },
                    body: JSON.stringify({
                        username,
                        password,
                        password2,
                        screen_name: screenName,
                    }),
                });

                const the_json = await response.json();
                attemptCreation(the_json);
            } catch (error) {
                console.error('Error during account creation:', error);
                setBackendErrorText('An unexpected error occurred. Please try again.');
                setBackendErrorVisible(true);
            }
        }
    }

    return (
        <div>
            <TextFieldWithError placeholder={"Username"} value={username as string} setValue={setUsername} errorVisible={usernameErrorVisible} />
            <TextFieldWithError password={true} placeholder={"Password"} value={password} setValue={setPassword1} errorVisible={password1ErrorVisible} />
            <TextFieldWithError password={true} placeholder={"Retype password"} value={password2} setValue={setPassword2} errorVisible={password2ErrorVisible} />
            <TextFieldWithError placeholder={"Screen name"} value={screenName} setValue={setScreenName} errorVisible={screenNameErrorVisible} />
            <label className="errorLabel" style={{ display: backendErrorVisible ? "block" : "none" }}>{backendErrorText}</label>
            <div className="inputContainer">
                <input className="inputButton" type="button" onClick={() => router.push('/')} value={'\u21A9 Back'} />
                <input id="submitButton" className="inputButton" type="button" onClick={onSubmitButtonClick} value={'Submit'} />
            </div>
        </div>
    );
}

export default function AccountCreation() {
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Enter") {
                event.preventDefault();
                (document.getElementById("submitButton") as HTMLInputElement).click();
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
                <div className="titleContainer">Create Account</div>
                <AccountCreationFields />
            </div>
        </div>
    )
}
