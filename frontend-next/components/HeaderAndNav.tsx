
import logo from '../public/images/logo.png';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Image from 'next/image';

type HeaderProps = {
    screenName: string;
};

function Header({ screenName }: HeaderProps) {
    const router = useRouter();

    async function handleLogout() {
        await fetch('/accounts/logout/');
        router.push('/');
    }

    return (
        <header>
            <Image src={logo} alt="Logo" id="logo" style={{ cursor: 'pointer' }} onClick={() => router.push(`/home`)} />
            <div id="header-text-container">
                <div id="header-text">SHIPPING HAZARDS</div>
                <div id="header-subtitle">A Battleship Game by Pink Puffy Rhinos</div>
            </div>
            <div id="user-info">
                <p>Hello, {screenName}!</p>
                <a onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</a>
            </div>
        </header>
    );
}

function NavigationBar() {
    const router = useRouter();

    function navigateToProfilePage() {
        router.push(`/profile`);
    }

    return (
        <nav>
            <a onClick={() => router.push(`/home`)}>Home</a>
            <span className="dropdown" tabIndex={0}>
                My Account
                <span className="dropdown-content">
                    <a onClick={navigateToProfilePage}>Profile & Settings</a>
                    <a onClick={() => router.push(`/stats`)}>Stats</a>
                    <a onClick={() => router.push(`/my-games`)}>My Games</a>
                </span>
            </span>
            <a onClick={() => router.push(`/about-us`)}>About Us</a>
        </nav>
    );
}

export default function HeaderAndNav({ username }: { username: any}) {
    const [screenName, setScreenName] = useState(username);
    const router = useRouter();

     useEffect(() => {
        if (router.query.dev) {
            setScreenName("Dev User");
            return;
        }
        // This useEffect hook will run once when the component mounts
        async function fetchScreenName() {
            try {
                const response = await fetch('/accounts/get_user_info/');
                if (response.ok) {
                    const data = await response.json();
                    setScreenName(data.screen_name);
                } else {
                    // Handle cases where the user is not logged in or session expired
                    // Redirect to login page
                    router.push('/');
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
                // Handle network errors, maybe redirect to an error page
            }
        }

        fetchScreenName();
    }, [router.query.dev]);

    if (!screenName) {
        return null;
    }

    return (
        <div style={{ width: '100%' }}>
            <Header screenName={screenName as string} />
            <NavigationBar />
        </div>
    );
}
