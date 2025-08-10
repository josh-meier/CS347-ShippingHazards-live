
import HeaderAndNav from '../components/HeaderAndNav';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import TextFieldWithError from '../components/TextFieldWithError';

export default function ProfilePage() {
    const router = useRouter();
    const { username, color: originalColor, screenName: originalScreenName } = router.query;

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword1, setNewPassword1] = useState('');
    const [newPassword2, setNewPassword2] = useState('');
    const [screenName, setScreenName] = useState('');
    const [color, setColor] = useState('#000000');

    useEffect(() => {
        if (router.isReady) {
            setScreenName(originalScreenName as string || '');
            setColor("#" + (originalColor as string || '000000'));
        }
    }, [router.isReady, originalScreenName, originalColor]);

    const [currentPasswordErrorVisible, setCurrentPasswordErrorVisible] = useState(false);
    const [newPassword1ErrorVisible, setNewPassword1ErrorVisible] = useState(false);
    const [newPassword2ErrorVisible, setNewPassword2ErrorVisible] = useState(false);
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

    function attemptPasswordChange(the_json: any) {
        setCurrentPasswordErrorVisible(false);
        setNewPassword1ErrorVisible(false);
        setNewPassword2ErrorVisible(false);
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

    async function handlePasswordClick() {
        setCurrentPasswordErrorVisible(currentPassword.length === 0);
        setNewPassword1ErrorVisible(newPassword1.length === 0);
        setNewPassword2ErrorVisible(newPassword2.length === 0);
        if (currentPassword.length > 0 && newPassword1.length > 0 && newPassword2.length > 0) {
            try {
                await fetch('/accounts/csrf/');
                const csrfToken = getCookie('csrftoken');

                const response = await fetch('/accounts/change_password/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken || '',
                    },
                    body: JSON.stringify({
                        old_password: currentPassword,
                        new_password1: newPassword1,
                        new_password2: newPassword2,
                    }),
                });

                const the_json = await response.json();
                attemptPasswordChange(the_json);
            } catch (error) {
                console.error('Error during password change:', error);
                setBackendErrorText('An unexpected error occurred. Please try again.');
                setBackendErrorVisible(true);
            }
        }
    }

    function handleScreenNameColorClick() {
        setScreenNameErrorVisible(screenName.length === 0);
        if (screenName.length > 0) {
            let url = `/change-player-preferences/${username}/${screenName}/${color.substring(color.indexOf("#") + 1)}`;
            fetch(url)
                .then(() => router.push(`/home?username=${username}`))
                .catch(error => console.error('Error fetching player preferences change: ', error));
        }
    }

    if (!router.isReady) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <HeaderAndNav username={username} />
            <main>
                <div id="account">Account name: {username}</div>
                <div id="profileSettings">

                    Current Password
                    <TextFieldWithError password={true} value={currentPassword} setValue={setCurrentPassword} errorVisible={currentPasswordErrorVisible} />
                    New Password
                    <TextFieldWithError password={true} value={newPassword1} setValue={setNewPassword1} errorVisible={newPassword1ErrorVisible} />
                    Retype New Password
                    <TextFieldWithError password={true} value={newPassword2} setValue={setNewPassword2} errorVisible={newPassword2ErrorVisible} />
                    <label className="errorLabel" style={{ display: backendErrorVisible ? "block" : "none" }}>{backendErrorText}</label>
                    <button onClick={handlePasswordClick}>Update</button><br />

                    Screen Name
                    <TextFieldWithError value={screenName as string} setValue={setScreenName} errorVisible={screenNameErrorVisible} />
                    Ship Color
                    <input type="color"
                        id="color"
                        name="color"
                        value={color}
                        onChange={(ev) => setColor(ev.target.value)}
                        style={{ marginLeft: '1em' }} /><br />
                    <button onClick={handleScreenNameColorClick}>Update</button><br />
                </div>
            </main>
        </div>
    );
}
