import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

function getCookie(name: string): string | null {
  let cookieValue = null;
  if (typeof document === 'undefined') return null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + '=') {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export default function InviteJoinPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const { gameId, boardSize } = router.query as { gameId: string; boardSize?: string };

    async function ensureAuth() {
      // Try to get current user; if not OK then create guest session
      let resp = await fetch('/accounts/get_user_info/', { credentials: 'include' });
      if (resp.status === 401 || resp.status === 403) {
        await fetch('/accounts/csrf/', { credentials: 'include' });
        const csrf = getCookie('csrftoken');
        await fetch('/accounts/guest_login/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf || '' },
          credentials: 'include',
          body: JSON.stringify({}),
        });
        resp = await fetch('/accounts/get_user_info/', { credentials: 'include' });
      }
      if (!resp.ok) throw new Error('Unable to authenticate');
      return resp.json();
    }

    async function joinAndRedirect() {
      try {
        const userInfo = await ensureAuth();
        const playerID = userInfo.player_id;
        const color = userInfo.color_preference;

        const joinResp = await fetch(`/play/change-opponent/${gameId}/${playerID}`, { credentials: 'include' });
        const joinJson = await joinResp.json();
        if (joinJson.status !== 1 && joinJson.player_2_id !== playerID) {
          setError('This room is full or unavailable.');
          return;
        }

        const bs = boardSize || '10';
        router.replace(`/game?joinID=${gameId}&boardSize=${bs}&playerID=${playerID}&color=${color}&playerNum=2&isAIGame=false&existingGame=false`);
      } catch (e: any) {
        setError(e?.message || 'Unable to join room.');
      }
    }

    joinAndRedirect();
  }, [router.isReady, router.query]);

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {error ? <div>{error}</div> : <div>Joining game...</div>}
    </div>
  );
}


