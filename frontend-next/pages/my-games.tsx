
import React, { useState, useEffect } from 'react';
import HeaderAndNav from '../components/HeaderAndNav';
import { useRouter } from 'next/router';

function MyGamesTable({ games, username }: { games: any[], username: string }) {
    const router = useRouter();

    function handleClick(game: any) {
        let url = `/play/get-player-info/${username}`;
        fetch(url)
            .then(response => response.json())
            .then((the_json) => {
                let playerID = the_json["player_id"];
                let color = the_json["color_preference"];
                let boardSize = 10;
                let playerNum = (game.player1_id === playerID) ? 1 : 2;
                let existingGame = true;
                router.push(`/game?gameID=${game.id}&boardSize=${boardSize}&playerID=${playerID}&username=${username}&color=${color}&playerNum=${playerNum}&isAIGame=${game.is_ai_game}&existingGame=${existingGame}`);
            })
            .catch(error => console.error('Error fetching player info and new game: ', error));
    }

    return (
        <div className='mygamestable'>
            <h1>Your Games!</h1>
            <table>
                <thead>
                    <tr>
                        <th> Game ID</th>
                        <th>Is AI Game</th>
                        <th>Status</th>
                        <th>Link</th>
                        <th>Turn</th>
                        <th>Number of Ships</th>
                        <th>Winner</th>
                        <th>Loser</th>
                    </tr>
                </thead>
                <tbody>
                    {games.map((game) => (
                        <tr key={game.id}>
                            <td>{game.id}</td>
                            <td>{game.is_ai_game ? 'Yes' : 'No'}</td>
                            <td>{game.status ? 'Inactive' : 'Active'}</td>
                            <td>
                                {game.status === 0 && (
                                    <button onClick={() => handleClick(game)}>Play</button>
                                )}
                            </td>
                            <td>{game.turn ? 'Mine' : 'Opponent'}</td>
                            <td>{game.num_ships} </td>
                            <td>{game.winner}</td>
                            <td>{game.loser}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function MyGamesPage() {
    const router = useRouter();
    const { username } = router.query;
    const [games, setGames] = useState([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (router.isReady) {
            let url = `/${username}/games/${filter}`;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    const sortedGames = data.sort((a: any, b: any) => (a.id < b.id) ? 1 : -1);
                    setGames(sortedGames);
                })
                .catch(error => console.error('Error fetching games:', error));
        }
    }, [router.isReady, username, filter]);

    if (!router.isReady) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <HeaderAndNav username={username} />
            <div className="toggle-buttons-container">
                <button
                    className={`toggle-button ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}>
                    All Games
                </button>
                <button
                    className={`toggle-button ${filter === 'active' ? 'active' : ''}`}
                    onClick={() => setFilter('active')}>
                    Active Games
                </button>
                <button
                    className={`toggle-button ${filter === 'inactive' ? 'active' : ''}`}
                    onClick={() => setFilter('inactive')}>
                    Inactive Games
                </button>
            </div>
            <MyGamesTable games={games} username={username as string} />
        </div>
    );
}
