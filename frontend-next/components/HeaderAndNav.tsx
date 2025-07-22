
import logo from '../public/images/logo.png';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Image from 'next/image';

type HeaderProps = {
    screenName: string;
    username: string;
};

function Header({ screenName, username }: HeaderProps) {
    const router = useRouter();

    return (
        <header>
            <Image src={logo} alt="Logo" id="logo" style={{ cursor: 'pointer' }} onClick={() => router.push(`/home?username=${username}`)} />
            <span id="header-text">SHIPPING HAZARDS: A Game By Pink Puffy Rhinos</span>
            <div id="user-info">
                <p>Hello, {screenName}!</p>
                <a href="/">Logout</a>
            </div>
        </header>
    );
}

function NavigationBar({ username }: { username: string }) {
    const router = useRouter();

    function navigateToProfilePage() {
        let url = "/play/get-player-info/" + username;
        fetch(url)
            .then(response => response.json())
            .then((the_json) => router.push(`/profile?username=${username}&color=${the_json["color_preference"]}&screenName=${the_json["screen_name"]}`))
            .catch(error => console.error('Error fetching player info: ', error));
    }

    return (
        <nav>
            <a onClick={() => router.push(`/home?username=${username}`)}>Home</a>
            <span className="dropdown">
                My Account
                <span className="dropdown-content">
                    <span onClick={navigateToProfilePage}>Profile & Settings</span>
                    <a onClick={() => router.push(`/stats?username=${username}`)}>Stats</a>
                    <a onClick={() => router.push(`/my-games?username=${username}`)}>My Games</a>
                </span>
            </span>
            <a onClick={() => router.push(`/about-us?username=${username}`)}>About Us</a>
        </nav>
    );
}

export default function HeaderAndNav({ username }: { username: any}) {
    const [screenName, setScreenName] = useState(username);

    useEffect(() => {
        if (username) {
            let url = `/play/get-player-info/${username}`;
            fetch(url)
                .then(response => response.json())
                .then(the_json => setScreenName(the_json["screen_name"]))
                .catch(error => console.error('Error fetching player stats: ', error));
        }
    }, [username]);

    if (!username) {
        return null;
    }

    return (
        <div>
            <Header screenName={screenName as string} username={username as string} />
            <NavigationBar username={username as string} />
        </div>
    );
}
