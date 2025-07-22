import HeaderAndNav from '../components/HeaderAndNav';
import { useRouter } from 'next/router';
import { useState } from 'react';
import TextFieldWithError from '../components/TextFieldWithError';

const boardSize = 10;
const numShips = 4;

function MultiplayerPopup({ closePopup, joinID, setJoinID, joinErrorVisible, setJoinErrorVisible, username }: any) {
    const router = useRouter();

    function attemptJoin(the_json: any, playerID: any, color: any) {
        let success = the_json["status"] === 1;
        let playerNum = 2;
        let existingGame = false;
        let isAIGame = false;
        if (success) {
            router.push(`/game?joinID=${joinID}&boardSize=${boardSize}&playerID=${playerID}&username=${username}&color=${color}&playerNum=${playerNum}&isAIGame=${isAIGame}&existingGame=${existingGame}`);
        } else {
            setJoinErrorVisible(true);
        }
    }

    function handleJoinClick() {
        if (joinID.length < 1) {
            setJoinErrorVisible(true);
        } else {
            let url = `/play/get-player-info/${username}`;
            fetch(url)
                .then(response => response.json())
                .then((the_json) => {
                    let playerID = the_json["player_id"];
                    let color = the_json["color_preference"];
                    let url2 = `/play/change-opponent/${joinID}/${playerID}`;
                    fetch(url2)
                        .then(response => response.json())
                        .then(the_json => attemptJoin(the_json, playerID, color));
                })
                .catch(error => console.error('Error fetching player info and opponent change: ', error));
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
                <NewGameButton text={"Create New Room"} isAI={false} opponentID={4} username={username} />
                <button className="popup-button" onClick={closePopup}>X</button>
            </div>
        </div>
    );
};

function NewGameButton({ text, isAI, opponentID, username }: any) {
    const router = useRouter();

    function redirectBrowser(the_json: any, playerID: any, color: any) {
        console.log("trying to redirect to game")
        let gameID = the_json["game_id"];
        let playerNum = 1;
        let existingGame = false;
        router.push(`/game?gameID=${gameID}&boardSize=${boardSize}&playerID=${playerID}&username=${username}&color=${color}&playerNum=${playerNum}&isAIGame=${isAI}&existingGame=${existingGame}`);
    }

    function handleClick() {
        console.log("fetching info")
        const url = `/play/get-player-info/${username}`;
        let playerID: any;
        let color: any;
        fetch(url)
            .then(response => response.json())
            .then(the_json => {
                playerID = the_json["player_id"];
                color = the_json["color_preference"];
                const url2 = `/play/new-game/${playerID}/${opponentID}/${numShips}/${boardSize}/${isAI}`;
                return fetch(url2);
            })
            .then(response => response.json())
            .then(the_json => redirectBrowser(the_json, playerID, color))
            .catch(error => console.error("Error:", error));
    }

    return (
        <button className="popup-button" type="button" onClick={handleClick}>{text}</button>
    );
}


function PlayMultiplayerButton({ username }: any) {
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
            <button className="button" type="button" onClick={openPopup}>Multiplayer</button>
            {popupOpen && <MultiplayerPopup closePopup={closePopup} joinID={joinID} setJoinID={setJoinID} joinErrorVisible={joinErrorVisible} setJoinErrorVisible={setJoinErrorVisible} username={username} />} 
        </div>
    );
}

// function PlayMainCompButton({ username }: any) {
//     const [popupOpen, setPopupOpen] = useState(false);

//     const openPopup = () => {
//         setPopupOpen(true);
//     };

//     const closePopup = ()_json) => {
//                 let playerID = the_json["player_id"];
//                 let color = the_json["color_preference"];
//                 let url2 = `/play/new-game?player1_id=${playerID}&player2_id=${opponentID}&num_ships=${numShips}&board_size=${boardSize}&is_ai_game=${isAI}`;
//                 fetch(url2)
//                     .then(response => response.json())
//                     .then(the_json => redirectBrowser(the_json, playerID, color));
//             })
//             .catch(error => console.error('Error fetching player info and new game: ', error));
//     }
//     return (
//         <button className="popup-button" type="button" onClick={handleClick}>{text}</button>
//     );
// }
function PlayMainCompButton({ username }: any) {
    const [popupOpen, setPopupOpen] = useState(false);

    const openPopup = () => setPopupOpen(true);
    const closePopup = () => setPopupOpen(false);

    const Popup = ({ closePopup }: any) => {
        return (
            <div className="popup-container">
                <div className="popup-body">
                    <NewGameButton text="Easy" isAI={true} opponentID={4} username={username} />
                    <NewGameButton text="Medium" isAI={true} opponentID={2} username={username} />
                    <NewGameButton text="Hard" isAI={true} opponentID={3} username={username} />
                    <button className="popup-button" onClick={closePopup}>X</button>
                </div>
            </div>
        );
    };

    return (
        <div>
            <button className="button" type="button" onClick={openPopup}>Play AI</button>
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
    const { username } = router.query;

    // Wait for the router to be ready and the username to be available
    if (!router.isReady) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <HeaderAndNav username={username} />
            <div className="buttons-container">
                <PlayMultiplayerButton username={username} />
                <PlayMainCompButton username={username} />
                <HowToPlayButton />
            </div>
        </div>
    );
}
