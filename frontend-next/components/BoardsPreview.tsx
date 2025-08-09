import React from 'react';

function PreviewRow({ pattern, row }: { pattern: 'left' | 'right'; row: number }) {
  const cells = Array.from({ length: 10 }, (_, col) => {
    const style: React.CSSProperties = {};
    if (pattern === 'left') {
      if ((row === 2 && col >= 2 && col <= 6) || (col === 7 && row >= 5 && row <= 8)) {
        style.backgroundColor = 'rgba(255, 105, 180, 0.35)';
      }
      if ((row === 2 && col === 4) || (row === 6 && col === 7)) {
        style.backgroundColor = 'rgba(220, 20, 60, 0.55)';
      }
      if ((row === 1 && col === 8) || (row === 8 && col === 1)) {
        style.backgroundColor = 'rgba(255,255,255,0.7)';
      }
    } else {
      if ((row === 4 && col >= 1 && col <= 4) || (col === 5 && row >= 6 && row <= 9)) {
        style.backgroundColor = 'rgba(255, 105, 180, 0.35)';
      }
      if ((row === 4 && col === 2) || (row === 7 && col === 5)) {
        style.backgroundColor = 'rgba(220, 20, 60, 0.55)';
      }
      if ((row === 0 && col === 0) || (row === 9 && col === 9)) {
        style.backgroundColor = 'rgba(255,255,255,0.7)';
      }
    }
    return <div key={`${pattern}-${row}-${col}`} className="board-square" style={style} />;
  });
  return <div className="board-row">{cells}</div>;
}

export default function BoardsPreview() {
  return (
    <div className="home-boards-backdrop" aria-hidden>
      <div className="preview-boards">
        <div id="content">
          <div className="content-row title-row">
            <div className="content-cell" style={{ width: '40%' }}>YOUR BOARD</div>
            <div className="content-cell" style={{ width: '20%' }} />
            <div className="content-cell" style={{ width: '40%' }}>OPPONENT BOARD</div>
          </div>
          <div className="content-row">
            <div className="content-cell" style={{ width: '40%' }}>
              <div className="board">
                {Array.from({ length: 10 }, (_, r) => (
                  <PreviewRow key={`left-row-${r}`} pattern="left" row={r} />
                ))}
              </div>
            </div>
            <div className="content-cell" style={{ width: '20%' }} />
            <div className="content-cell" style={{ width: '40%' }}>
              <div className="board">
                {Array.from({ length: 10 }, (_, r) => (
                  <PreviewRow key={`right-row-${r}`} pattern="right" row={r} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


