import HeaderAndNav from '../components/HeaderAndNav';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import hitImage from '../public/images/HitPopup.png';
import sunkImage from '../public/images/SunkPopup.png';
import muteIcon from '../public/images/mute.png';
import unMuteIcon from '../public/images/unmute.png';

// Sound paths
const hitSound = '/sounds/hitSound.mp3';
const missSound = '/sounds/missSound.mp3';
const sunkSound = '/sounds/sunkSound.mp3';
const lobbyMusic = '/sounds/lobbyMusic.mp3';


// Module-level variables for functions that don't depend on React state/props
let boardSize: number = 10;
let numShipsGlobal: number = 4;
let playerBoard = "-----------a---------a------------cccc----------------b---------b---------b--------------------ddddd";
let selectedShip: number[][] | null = null;
let shipColor: string;

function entireShipAt(id: string, board: string) {
    let row = Number(id.slice(id.indexOf("-") + 1, id.lastIndexOf("-")));
    let col = Number(id.slice(id.lastIndexOf("-") + 1));
    let coords = [];
    if (!board || row === null || col === null) return [];
    let letter = board[(row * boardSize) + col];
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            if (board[(r * boardSize) + c] === letter) {
                coords.push([r, c]);
            }
        }
    }
    return coords;
}

function legalSelectedShipMovement(changeFunct: (coords: number[], ship: number[][]) => number[]) {
    if (!selectedShip) return false;
    for (let i = 0; i < selectedShip.length; i++) {
        let ship = selectedShip[i];
        let newCoords = changeFunct(ship, selectedShip);
        let row = newCoords[0];
        let col = newCoords[1];
        if (row < 0 || row >= boardSize || col < 0 || col >= boardSize || (playerBoard[(row * boardSize) + col] !== "-" && playerBoard[(row * boardSize) + col] !== playerBoard[(ship[0] * boardSize) + ship[1]])) {
            return false;
        }
    }
    return true;
}

function applySelectedShipMovement(changeFunct: (coords: number[], ship: number[][]) => number[]) {
    if (!selectedShip) return;
    let shipLetter = playerBoard[(selectedShip[0][0] * boardSize) + selectedShip[0][1]];

    for (let i = 0; i < selectedShip.length; i++) {
        let ship = selectedShip[i];
        let id = "mysquare-" + ship[0] + "-" + ship[1];
        (document.getElementById(id) as HTMLElement).style.backgroundColor = "rgba(0, 0, 0, 0)";
        let ind = (ship[0] * boardSize) + ship[1];
        playerBoard = playerBoard.substring(0, ind) + "-" + playerBoard.substring(ind + 1);
        let newCoords = changeFunct(ship, selectedShip);
        ship[0] = newCoords[0];
        ship[1] = newCoords[1];
    }

    selectedShip.forEach(function (ship) {
        let id = "mysquare-" + ship[0] + "-" + ship[1];
        (document.getElementById(id) as HTMLElement).style.backgroundColor = "blue";
        let ind = (ship[0] * boardSize) + ship[1];
        playerBoard = playerBoard.substring(0, ind) + shipLetter + playerBoard.substring(ind + 1);
    });
}

function BoardSquare({ id, row, column, myBoard, status, gameID, playerID }: { id: string, row: number, column: number, myBoard: boolean, status: string, gameID: string, playerID: number }) {
    const handleClickSetup = () => {
        if (myBoard) {
            if (selectedShip !== null) {
                selectedShip.forEach(function (ship) {
                    let id = "mysquare-" + ship[0] + "-" + ship[1];
                    (document.getElementById(id) as HTMLElement).style.backgroundColor = shipColor;
                })
            }
            selectedShip = null;
            if (playerBoard[(row * boardSize) + column] !== "-") {
                selectedShip = entireShipAt(id, playerBoard);
                selectedShip.forEach(function (ship) {
                    let id = "mysquare-" + ship[0] + "-" + ship[1];
                    (document.getElementById(id) as HTMLElement).style.backgroundColor = "blue";
                });
            }
        }
    };

    const handleClickGameplay = () => {
        if (!myBoard && status === "player_turn" && document.getElementById(id)?.style.backgroundColor === "blue") {
            fetch(`/play/fire-shot/${gameID}/${playerID}/${row}/${column}`)
                .catch(error => console.error('Error fetching fire shot: ', error));
        }
    };

    const handleMouseEnter = () => {
        if (!myBoard && status === "player_turn" && document.getElementById(id)?.style.backgroundColor === "rgba(0, 0, 0, 0)") {
            (document.getElementById(id) as HTMLElement).style.backgroundColor = "blue";
        }
    };

    const handleMouseLeave = () => {
        if (!myBoard && status === "player_turn" && document.getElementById(id)?.style.backgroundColor === "blue") {
            (document.getElementById(id) as HTMLElement).style.backgroundColor = 'rgba(0, 0, 0, 0)';
        }
    };

    return (
        <div className="board-square" id={id}
            onClick={status === "setup" ? handleClickSetup : handleClickGameplay}
            onMouseEnter={status === "player_turn" ? handleMouseEnter : undefined}
            onMouseLeave={status === "player_turn" ? handleMouseLeave : undefined}
            style={{
                backgroundColor: (myBoard && playerBoard[(row * boardSize) + column] !== "-") ? shipColor : 'rgba(0, 0, 0, 0)'
            }}>
        </div>
    );
}

function BoardRow({ row, myBoard, status, gameID, playerID }: { row: number, myBoard: boolean, status: string, gameID: string, playerID: number }) {
    const arr = [];
    for (let i = 0; i < boardSize; i++) {
        const key = (myBoard ? "mysquare-" : "opponentsquare-") + row + "-" + i;
        arr.push(<BoardSquare key={key} id={key} row={row} column={i} myBoard={myBoard} status={status} gameID={gameID} playerID={playerID} />);
    }
    return <div className="board-row">{arr}</div>;
}

function Board({ myBoard, status, hitPopupVisible, sunkPopupVisible, gameID, playerID }: { myBoard: boolean, status: string, hitPopupVisible: boolean, sunkPopupVisible: boolean, gameID: string, playerID: number }) {
    const arr = [];
    for (let i = 0; i < boardSize; i++) {
        arr.push(<BoardRow key={"row" + i} row={i} myBoard={myBoard} status={status} gameID={gameID} playerID={playerID} />);
    }
    return (
        <div className="board">
            {arr}
            <ComicPopup isVisible={hitPopupVisible} image={hitImage} />
            <ComicPopup isVisible={sunkPopupVisible} image={sunkImage} />
        </div>
    );
}

function Instructions({ status }: { status: string }) {
    const messages: { [key: string]: string } = {
        loading_game: "Loading game data; please wait...",
        setup: "Setup Stage: Click on a ship, then use the buttons or arrow keys and spacebar to place it where you want",
        player_turn: "Your Turn: Choose a square on your opponent's board to attack",
        opp_turn: "Waiting for opponent...",
        setup_confirmed: "Waiting for opponent...",
    };
    return <div id="gameplay-instructions">{messages[status] || ""}</div>;
}

function ConfirmButton({ status, setStatus, gameID, playerID, isDev }: { status: string, setStatus: (status: string) => void, gameID: string, playerID: number, isDev: boolean }) {
    const handleClick = () => {
        if (selectedShip !== null) {
            selectedShip.forEach(ship => {
                const id = "mysquare-" + ship[0] + "-" + ship[1];
                (document.getElementById(id) as HTMLElement).style.backgroundColor = shipColor;
            });
            selectedShip = null;
        }
        console.log("DEBUG: ConfirmButton clicked.");
        setStatus("setup_confirmed");
        if (!isDev) {
            fetch(`/play/confirm-ships/${gameID}/${playerID}/${playerBoard}`)
                .catch(error => console.error('Error fetching confirm ships:', error));
        }
    };

    return (
        <div className="confirm-container">
            {status === "setup" && <button className="confirm-button" onClick={handleClick}>Confirm!</button>}
        </div>
    );
}

function GameOverPopup({ status }: { status: string }) {
    const router = useRouter();
    if (status !== "player_won" && status !== "opp_won") return null;
    return (
        <div id="gameOverPopup" style={{ visibility: 'visible' }}>
            <div>GAME OVER</div>
            <div>{status === "player_won" ? "You Won!" : "You Lost :("}</div><br />
            <button className="confirm-button" onClick={() => router.push(`/home`)}>Back to Home</button>
        </div>
    );
}

function ComicPopup({ isVisible, image }: { isVisible: boolean, image: any }) {
    if (!isVisible) return null;
    return (
        <div style={{ width: '120%', display: 'block', zIndex: 1000, position: 'absolute', top: '5%', left: '-10%' }}>
            <Image
                src={image}
                alt="Comic-book style popup"
                style={{ width: '100%', height: 'auto', display: 'block' }}
                sizes="(max-width: 650px) 98vw, (max-width: 1000px) 50vw, 40vw"
            />
        </div>
    );
}

function BoardsAndTitles({ status, setStatus, popups1, popups2, gameID, playerID, playerNum, isDev }:
    { status: string, setStatus: (status: string) => void, popups1: any, popups2: any, gameID: string, playerID: number, playerNum: number, isDev: boolean }) {

    const handleKeys = useCallback((e: KeyboardEvent) => {
        if (selectedShip !== null && status === "setup") {
            if (e.code === "Space" || e.code.startsWith("Arrow")) {
                e.preventDefault();
                let changeFunct: ((coords: number[], ship: number[][]) => number[]) | null = null;
                if (e.code === "ArrowRight") changeFunct = (coords) => [coords[0], coords[1] + 1];
                else if (e.code === "ArrowLeft") changeFunct = (coords) => [coords[0], coords[1] - 1];
                else if (e.code === "ArrowUp") changeFunct = (coords) => [coords[0] - 1, coords[1]];
                else if (e.code === "ArrowDown") changeFunct = (coords) => [coords[0] + 1, coords[1]];
                else if (e.code === "Space") {
                    findRotation:
                    for (let i = 0; i < selectedShip.length; i++) {
                        for (let p = 0; p <= 1; p++) {
                            for (let q = 0; q <= 1; q++) {
                                const potentialFunc = (coords: number[], ship: number[][]) => {
                                    const startingRow = ship[i][0];
                                    const startingCol = ship[i][1];
                                    const rowDiff = startingRow - coords[0];
                                    const colDiff = startingCol - coords[1];
                                    const newRow = p ? startingRow - colDiff : startingRow + colDiff;
                                    const newCol = q ? startingCol - rowDiff : startingCol + rowDiff;
                                    return [newRow, newCol];
                                };
                                if (legalSelectedShipMovement(potentialFunc)) {
                                    changeFunct = potentialFunc;
                                    break findRotation;
                                }
                            }
                        }
                    }
                }

                if (changeFunct && legalSelectedShipMovement(changeFunct)) {
                    applySelectedShipMovement(changeFunct);
                }
            } else if (e.code === "Enter") {
                selectedShip.forEach(ship => {
                    const id = "mysquare-" + ship[0] + "-" + ship[1];
                    (document.getElementById(id) as HTMLElement).style.backgroundColor = shipColor;
                });
                selectedShip = null;
            }
        }
    }, [status]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeys);
        return () => document.removeEventListener('keydown', handleKeys);
    }, [handleKeys]);

    const triggerKey = (code: string) => {
        const evt = new KeyboardEvent('keydown', { code });
        document.dispatchEvent(evt);
    };

    function randomizeBoard(): void {
        // Generate a blank board array
        const size = boardSize;
        const lettersForShips = (num: number): number[] => {
            if (num === 4) return [2, 3, 4, 5];
            if (num === 5) return [2, 3, 3, 4, 5];
            if (num === 6) return [2, 3, 3, 4, 4, 5];
            return [2, 3, 4, 5];
        };
        const shipSizes = lettersForShips(numShipsGlobal);
        const board: string[] = Array(size * size).fill('-');

        const placeOneShip = (shipSize: number, letter: string): boolean => {
            const horizontal = Math.random() < 0.5;
            if (horizontal) {
                const row = Math.floor(Math.random() * size);
                const col = Math.floor(Math.random() * (size - shipSize));
                for (let i = 0; i < shipSize; i++) {
                    if (board[row * size + col + i] !== '-') return false;
                }
                for (let i = 0; i < shipSize; i++) board[row * size + col + i] = letter;
            } else {
                const row = Math.floor(Math.random() * (size - shipSize));
                const col = Math.floor(Math.random() * size);
                for (let i = 0; i < shipSize; i++) {
                    if (board[(row + i) * size + col] !== '-') return false;
                }
                for (let i = 0; i < shipSize; i++) board[(row + i) * size + col] = letter;
            }
            return true;
        };

        let letterIndex = 0;
        for (const shipSize of shipSizes) {
            let placed = false;
            letterIndex += 1;
            const letter = String.fromCharCode(letterIndex + 96); // a, b, c, ...
            let guard = 0;
            while (!placed && guard < 500) {
                placed = placeOneShip(shipSize, letter);
                guard++;
            }
            if (!placed) return; // give up if pathological
        }

        // Apply to UI
        playerBoard = board.join('');
        selectedShip = null;
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const id = `mysquare-${r}-${c}`;
                const el = document.getElementById(id) as HTMLElement | null;
                if (!el) continue;
                el.style.backgroundColor = playerBoard[r * size + c] !== '-' ? shipColor : 'rgba(0, 0, 0, 0)';
            }
        }
    }

    return (
        <div id="content">
            <div className="content-row">
                <div className="content-cell" style={{ width: '40%' }}>
                    <div className="board-header">
                        <div className="board-title">YOUR BOARD</div>
                    </div>
                    <Board myBoard={true} status={status} {...popups1} gameID={gameID} playerID={playerID} />
                    {status === 'setup' && (
                        <div className="setup-controls-row">
                            <div className="setup-controls" role="group" aria-label="Ship placement controls">
                                <button className="control-btn up" onClick={() => triggerKey('ArrowUp')} aria-label="Move up">▲</button>
                                <button className="control-btn left" onClick={() => triggerKey('ArrowLeft')} aria-label="Move left">◀</button>
                                <button className="control-btn center" onClick={() => triggerKey('Space')} aria-label="Rotate">
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M14 3.5a8 8 0 0 1 6 6" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"/>
                                        <path d="M20 9.5v-4l-3 3" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M10 20.5a8 8 0 0 1-6-6" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"/>
                                        <path d="M4 14.5v4l3-3" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                                <button className="control-btn right" onClick={() => triggerKey('ArrowRight')} aria-label="Move right">▶</button>
                                <button className="control-btn down" onClick={() => triggerKey('ArrowDown')} aria-label="Move down">▼</button>
                            </div>
                        </div>
                    )}
                    {status === 'setup' && (
                        <div className="setup-controls-row">
                            <button className="randomize-button" onClick={randomizeBoard}>Randomize</button>
                        </div>
                    )}
                </div>
                <div className="content-cell" style={{ width: '20%', verticalAlign: 'middle' }}>
                    <Instructions status={status} />
                    <ConfirmButton status={status} setStatus={setStatus} gameID={gameID} playerID={playerID} isDev={isDev} />
                </div>
                <div className="content-cell" style={{ width: '40%' }}>
                    <div className="board-header"><div className="board-title">OPPONENT BOARD</div></div>
                    <Board myBoard={false} status={status} {...popups2} gameID={gameID} playerID={playerID} />
                </div>
            </div>
        </div>
    );
}

function RoomIDText({ status, gameID, playerNum }: { status: string, gameID: string, playerNum: number }) {
    if (playerNum !== 1) return null;
    // const text = status === "setup" ? `Tell your friend to join with this ID -> Room ID: ${gameID}` : `Room ID: ${gameID}`;
    const text = `Tell your friend to join with this ID -> Room ID: ${gameID}`;
    
    return (status === "setup" ? <div id="gameIDText">{text}</div> : null);
}

function MuteButton({ muted, setMuted }: { muted: boolean, setMuted: (muted: boolean) => void }) {
    return (
        <Image
            style={{ width: '2em', height: '2em', cursor: 'pointer' }}
            src={muted ? muteIcon : unMuteIcon}
            alt="speaker"
            onClick={() => setMuted(!muted)}
        />
    );
}

export default function GamePlay() {
    const router = useRouter();
    const socketRef = useRef<WebSocket | null>(null);
    const musicRef = useRef<HTMLAudioElement | null>(null);

    const [status, setStatus] = useState<string>("loading");
    const [gameID, setGameID] = useState<string>('');
    const [playerID, setPlayerID] = useState<number>(0);
    const [playerNum, setPlayerNum] = useState<number>(0);
    const [isAIGame, setIsAIGame] = useState<boolean>(false);
    const [muted, setMuted] = useState(true);
    const [copied, setCopied] = useState(false);
    const [qrOpen, setQrOpen] = useState(false);

    const inviteUrl = useMemo(() => {
        if (typeof window === 'undefined' || !gameID) return '';
        return `${window.location.origin}/invite/${gameID}?boardSize=${boardSize}`;
    }, [gameID]);

    const [hitPopup1Visible, setHitPopup1Visible] = useState(false);
    const [hitPopup2Visible, setHitPopup2Visible] = useState(false);
    const [sunkPopup1Visible, setSunkPopup1Visible] = useState(false);
    const [sunkPopup2Visible, setSunkPopup2Visible] = useState(false);

    const stateRef = useRef({playerID, playerNum, muted, status});
    useEffect(() => {
        stateRef.current = {playerID, playerNum, muted, status};
    }, [playerID, playerNum, muted, status]);

    const isDevMode = useMemo(() => {
        const devParam = router.query.dev;
        if (Array.isArray(devParam)) return devParam.includes('true');
        return devParam === 'true';
    }, [router.query.dev]);

    useEffect(() => {
        if (!router.isReady) return;

        const {
            gameID: gameID_q, joinID: joinID_q, boardSize: boardSize_q, playerID: playerID_q,
            color: shipColor_q, playerNum: playerNum_q,
            isAIGame: isAIGame_q, existingGame: existingGame_q, numShips: numShips_q,
        } = router.query;

        const gameIdRaw = (gameID_q || joinID_q) as string | undefined;
        boardSize = parseInt(boardSize_q as string, 10) || 10;
        const pID = parseInt(playerID_q as string, 10);
        const pNum = parseInt(playerNum_q as string, 10);
        numShipsGlobal = parseInt(numShips_q as string, 10) || 4;

        let effectiveGameId = gameIdRaw;
        let effectivePID = !isNaN(pID) ? pID : undefined;
        let effectivePNUM = !isNaN(pNum) ? pNum : undefined;
        let effectiveShipColor = (shipColor_q as string) || '#ff8ac7';
        if (effectiveShipColor && effectiveShipColor[0] !== '#') {
            effectiveShipColor = '#' + effectiveShipColor;
        }

        // In dev mode, fill in defaults if missing and skip server/ws
        if (isDevMode) {
            if (!effectiveGameId) effectiveGameId = 'DEVGAME';
            if (effectivePID === undefined) effectivePID = 999;
            if (effectivePNUM === undefined) effectivePNUM = 1;

            setGameID(effectiveGameId);
            setPlayerID(effectivePID);
            setPlayerNum(effectivePNUM);
            setIsAIGame(true);
            shipColor = effectiveShipColor;
            setStatus('setup');
            return;
        }

        // Normal mode
        setGameID((gameIdRaw as string) || '');
        setPlayerID(!isNaN(pID) ? pID : 0);
        setPlayerNum(!isNaN(pNum) ? pNum : 0);
        setIsAIGame(isAIGame_q === 'true');
        shipColor = effectiveShipColor;

        setStatus(existingGame_q === 'true' ? 'loading_game' : 'setup');

        if (!isDevMode && typeof window !== 'undefined' && gameIdRaw) {
            console.log("LOCATION:", {
                href:     window.location.href,
                protocol: window.location.protocol,
                host:     window.location.host,
                hostname: window.location.hostname,
                port:     window.location.port,
            });
            const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
            // const hostName = window.location.host;
            const hostName = window.location.host.includes("3001")
                                ? `${window.location.hostname}:8001`   // → dev: localhost:8001
                                : window.location.host;                // → prod: shippinghazards.com
            const wsUrl = `${protocol}://${hostName}/ws/play/${gameIdRaw}/`;

            console.log("DEBUG: Connecting to WebSocket at:", wsUrl);
            const socket = new WebSocket(wsUrl);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log("DEBUG: WebSocket connection established.");
            };

            socket.onclose = (event) => {
                console.log("DEBUG: WebSocket connection closed.", event);
            };

            socket.onerror = (error) => {
                console.error("DEBUG: WebSocket error:", error);
            };

            socket.onmessage = (event: MessageEvent) => {
                console.log('DEBUG: WebSocket message received:', event.data);
                const message = JSON.parse(JSON.parse(event.data)["message"]);
                
                // Use the state from the ref to ensure we have the latest values
                const { playerID, playerNum, muted, status } = stateRef.current;
                console.log(`DEBUG: Processing message with state: status=${status}, playerNum=${playerNum}, playerID=${playerID}`);

                const { player1_ship_status, player2_ship_status, turn, status: gameStatus } = message;

                if (status === "setup" || status === "setup_confirmed") {
                    if (player1_ship_status === 1 && player2_ship_status === 1) {
                        const newStatus = turn === playerNum ? "player_turn" : "opp_turn";
                        console.log(`DEBUG: Both players confirmed. Turn: ${turn}. Setting new status to: ${newStatus}`);
                        setStatus(newStatus);
                    }
                    return;
                }

                const { player_id, ship_board, is_hit, is_sunk, shot_row, shot_col } = message;
                const myBoard = player_id === playerID;
                const id = `${myBoard ? "mysquare" : "opponentsquare"}-${shot_row}-${shot_col}`;
                const hitElement = document.getElementById(id) as HTMLElement;

                if (is_hit && is_sunk) {
                    myBoard ? setSunkPopup1Visible(true) : setSunkPopup2Visible(true);
                    if(hitElement) hitElement.style.backgroundColor = "red";
                    if (!muted) new Audio(sunkSound).play();
                    setTimeout(() => {
                        myBoard ? setSunkPopup1Visible(false) : setSunkPopup2Visible(false);
                        entireShipAt(id, ship_board).forEach(sq => {
                            const sunkId = `${myBoard ? "mysquare" : "opponentsquare"}-${sq[0]}-${sq[1]}`;
                            const sunkElement = document.getElementById(sunkId) as HTMLElement;
                            if(sunkElement) sunkElement.style.backgroundColor = "gray";
                        });
                    }, 2000);
                } else if (is_hit) {
                    myBoard ? setHitPopup1Visible(true) : setHitPopup2Visible(true);
                    if(hitElement) hitElement.style.backgroundColor = "red";
                    if (!muted) new Audio(hitSound).play();
                    setTimeout(() => myBoard ? setHitPopup1Visible(false) : setHitPopup2Visible(false), 2000);
                } else {
                    if(hitElement) hitElement.style.backgroundColor = "white";
                    if (!muted) new Audio(missSound).play();
                }

                if (gameStatus > 0) {
                    const newStatus = gameStatus === playerNum ? "player_won" : "opp_won";
                    setStatus(newStatus);
                } else {
                    const newStatus = turn === playerNum ? "player_turn" : "opp_turn";
                    setStatus(newStatus);
                }
            };
        }

        return () => {
            if (!isDevMode && socketRef.current?.readyState === 1) { 
                socketRef.current?.close();
            }
        };
    }, [router.isReady, router.query, isDevMode]);


    if (status === "loading" || !gameID) {
        return <div>Loading...</div>;
    }

    return (
        <div className="game-root">
            <HeaderAndNav username={null} />
            {/* Invite banner under nav for multiplayer games */}
            {!isAIGame && (
                <div style={{ position: 'relative', top: 0, zIndex: 900, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '.25em' }}>
                    <div className="invite-banner" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', padding: '4px 8px' }}>
                        <span style={{ fontWeight: 600 }}>Invite link:</span>
                        <span className="invite-link" style={{ userSelect: 'all', whiteSpace: 'nowrap' }}>{inviteUrl}</span>
                        <button
                            className="copy-button inputButton"
                            style={{ lineHeight: '1.6', fontSize: '0.9rem', padding: '0.2em 0.6em', width: 'auto', margin: 0 }}
                            onClick={() => {
                                if (typeof window === 'undefined') return;
                                navigator.clipboard.writeText(inviteUrl);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            }}
                        >{copied ? 'Copied!' : 'Copy'}</button>
                        <button
                            className="qr-button inputButton"
                            style={{ lineHeight: '1.6', fontSize: '0.9rem', padding: '0.2em 0.6em', width: 'auto', margin: 0 }}
                            onClick={() => setQrOpen(true)}
                        >QR Code</button>
                    </div>
                    <RoomIDText status={status} gameID={gameID} playerNum={playerNum} />
                    <div style={{ alignSelf: 'flex-end', padding: '0 .75em' }}>
                        <MuteButton muted={muted} setMuted={setMuted} />
                    </div>
                </div>
            )}
            {qrOpen && (
                <div className="modal-overlay" onClick={() => setQrOpen(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="inputButton modal-close"
                            onClick={() => setQrOpen(false)}
                            aria-label="Close"
                        >×</button>
                        <div style={{ fontSize: '0.95rem', marginBottom: '8px', textAlign: 'center' }}>Scan to join game</div>
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(inviteUrl)}`}
                            alt="QR code to join game"
                            style={{ display: 'block', width: '240px', height: '240px' }}
                        />
                    </div>
                </div>
            )}
            {!(!isAIGame) && (
                <div style={{ position: 'sticky', top: 0, zIndex: 900, display: 'flex', justifyContent: 'flex-end', padding: '.25em 1em 0 1em' }}>
                    <MuteButton muted={muted} setMuted={setMuted} />
                </div>
            )}
            <audio ref={musicRef} src={lobbyMusic} loop />
            {/* {!isDevMode && !isAIGame && <RoomIDText status={status} gameID={gameID} playerNum={playerNum} />} */}
            <BoardsAndTitles
                status={status}
                setStatus={setStatus}
                popups1={{ hitPopupVisible: hitPopup1Visible, sunkPopupVisible: sunkPopup1Visible }}
                popups2={{ hitPopupVisible: hitPopup2Visible, sunkPopupVisible: sunkPopup2Visible }}
                gameID={gameID}
                playerID={playerID}
                playerNum={playerNum}
                isDev={isDevMode}
            />
            <GameOverPopup status={status} />
        </div>
    );
}
