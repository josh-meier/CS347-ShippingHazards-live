import HeaderAndNav from '../components/HeaderAndNav';
import BoardsPreview from '../components/BoardsPreview';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import TextFieldWithError from '../components/TextFieldWithError';

const boardSize = 10;
const numShips = 4;

function MultiplayerPopup({ closePopup, joinID, setJoinID, joinErrorVisible, setJoinErrorVisible }: any) {
    const router = useRouter();

    async function attemptJoin(the_json: any, playerID: any, color: any) {
        let success = the_json["status"] === 1;
        let playerNum = 2;
        let existingGame = false;
        let isAIGame = false;
        if (success) {
            router.push(`/game?joinID=${joinID}&boardSize=${boardSize}&playerID=${playerID}&color=${color}&playerNum=${playerNum}&isAIGame=${isAIGame}&existingGame=${existingGame}`);
        } else {
            setJoinErrorVisible(true);
        }
    }

    async function handleJoinClick() {
        if (joinID.length < 1) {
            setJoinErrorVisible(true);
        } else {
            try {
                const response = await fetch('/accounts/get_user_info/');
                const userInfo = await response.json();
                const playerID = userInfo["player_id"];
                const color = userInfo["color_preference"];

                const joinResponse = await fetch(`/play/change-opponent/${joinID}/${playerID}`);
                const joinJson = await joinResponse.json();
                attemptJoin(joinJson, playerID, color);

            } catch (error) {
                console.error('Error fetching player info and opponent change: ', error)
            }
        }
    }

    return (
        <div className="popup-container">
            <div className="popup-body">
                <TextFieldWithError
                    placeholder={"Join Room ID"}
                    value={joinID}
                    setValue={setJoinID}
                    errorVisible={joinErrorVisible}
                    errorMessage={"Invalid game ID, or game is already full. After your friend starts a game, ask them for the ID."}
                    style={{ width: '10em', display: 'inline' }} />
                <button className="popup-button" type="button" onClick={handleJoinClick}>Join Room</button>
                <NewGameButton text={"Create New Room"} isAI={false} opponentID={4} />
                <button className="popup-button" onClick={closePopup}>X</button>
            </div>
        </div>
    );
};

function NewGameButton({ text, isAI, opponentID }: any) {
    const router = useRouter();

    function redirectBrowser(the_json: any, playerID: any, color: any) {
        console.log("trying to redirect to game")
        let gameID = the_json["game_id"];
        let playerNum = 1;
        let existingGame = false;
        router.push(`/game?gameID=${gameID}&boardSize=${boardSize}&playerID=${playerID}&color=${color}&playerNum=${playerNum}&isAIGame=${isAI}&existingGame=${existingGame}`);
    }

    async function handleClick() {
        try {
            const response = await fetch('/accounts/get_user_info/');
            const userInfo = await response.json();
            const playerID = userInfo["player_id"];
            const color = userInfo["color_preference"];

            const newGameResponse = await fetch(`/play/new-game/${playerID}/${opponentID}/${numShips}/${boardSize}/${isAI}`);
            const newGameJson = await newGameResponse.json();
            redirectBrowser(newGameJson, playerID, color);
        } catch (error) {
            console.error("Error:", error)
        }
    }

    return (
        <button className="popup-button" type="button" onClick={handleClick}>{text}</button>
    );
}


function PlayMultiplayerButton() {
    const [popupOpen, setPopupOpen] = useState(false);
    const [joinErrorVisible, setJoinErrorVisible] = useState(false);
    const [joinID, setJoinID] = useState('');

    const openPopup = () => {
        setPopupOpen(true);
        setJoinErrorVisible(false);
    };

    const closePopup = () => {
        setPopupOpen(false);
    };

    return (
        <div>
            <button className="button" type="button" onClick={openPopup}>Play with a friend</button>
            {popupOpen && <MultiplayerPopup closePopup={closePopup} joinID={joinID} setJoinID={setJoinID} joinErrorVisible={joinErrorVisible} setJoinErrorVisible={setJoinErrorVisible} />} 
        </div>
    );
}

function PlayMainCompButton() {
    const [popupOpen, setPopupOpen] = useState(false);

    const openPopup = () => setPopupOpen(true);
    const closePopup = () => setPopupOpen(false);

    const Popup = ({ closePopup }: any) => {
        return (
            <div className="popup-container">
                <div className="popup-body">
                    <NewGameButton text="Easy" isAI={true} opponentID={4} />
                    <NewGameButton text="Medium" isAI={true} opponentID={2} />
                    <NewGameButton text="Hard" isAI={true} opponentID={3} />
                    <button className="popup-button" onClick={closePopup}>X</button>
                </div>
            </div>
        );
    };

    return (
        <div>
            <button className="button" type="button" onClick={openPopup}>Play with a CPU</button>
            {popupOpen && <Popup closePopup={closePopup} />}
        </div>
    );
}



function HowToPlayButton() {
    const [popupOpen, setPopupOpen] = useState(false);

    const openPopup = () => {
        setPopupOpen(true);
    };

    const closePopup = () => {
        setPopupOpen(false);
    };

    const Popup = ({ closePopup }: any) => {
        return (
            <div className="popup-container">
                <div className="howto-popup-paragraph">
                    <button className="popup-button" onClick={closePopup} style={{ float: 'right' }}>X</button>
                    <div>
                        Choose if you want to play with another person or with an AI.<br /><br />
                        Then place your ships in the postitions you would like, using the arrow keys and space bar.<br /><br />
                        Players will take turns trying to hit the ships of their opponents on the grid by clicking.<br /><br />
                        If you get a hit or fully sink a ship, you get to go again.<br /><br />
                        Whoever sinks all of your oppenent's ships first, WINS!<br /><br />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <button className="button" type="button" onClick={openPopup}> How to Play?</button>
            {popupOpen && <Popup closePopup={closePopup} />}
        </div>
    );
}

export default function HomePage() {
    const router = useRouter();
    useEffect(() => {
        router.prefetch('/game').catch(() => {});
    }, [router]);

    // Wait for the router to be ready
    if (!router.isReady) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ width: '100%', minHeight: '100vh' }}>
            <HeaderAndNav username={null} />
            <div className="home-boards-backdrop">
                <BoardsPreview />
                <div className="buttons-container">
                    <PlayMultiplayerButton />
                    <PlayMainCompButton />
                    <HowToPlayButton />
                </div>
            </div>
        </div>
    );
}
