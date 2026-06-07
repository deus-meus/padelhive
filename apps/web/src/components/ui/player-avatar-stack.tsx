"use client";

export interface PlayerAvatar {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface PlayerAvatarStackProps {
  players: PlayerAvatar[];
  maxVisible?: number;
  size?: number;
  showCount?: boolean;
  totalSpots?: number;
}

export function PlayerAvatarStack({
  players,
  maxVisible = 3,
  size = 36,
  showCount = true,
  totalSpots,
}: PlayerAvatarStackProps) {
  const visible = players.slice(0, maxVisible);
  const remaining = players.length - maxVisible;
  const spotsLeft = totalSpots ? totalSpots - players.length : 0;

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex" style={{ marginLeft: 0 }}>
        {visible.map((player, i) => (
          <div
            key={player.id}
            className="relative shrink-0 overflow-hidden rounded-full border-2 border-[#0C1B26] bg-[#0F2030]"
            style={{
              width: size,
              height: size,
              marginLeft: i === 0 ? 0 : -10,
              zIndex: maxVisible - i,
            }}
          >
            {player.avatarUrl ? (
              <img
                src={player.avatarUrl}
                alt={player.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                }}
              />
            ) : null}
            <span
              className={`absolute inset-0 flex items-center justify-center text-[10px] font-medium text-[#F7F7F7]/60 ${
                player.avatarUrl ? "hidden" : ""
              }`}
              style={{ fontSize: size * 0.3 }}
            >
              {getInitials(player.name)}
            </span>
          </div>
        ))}

        {remaining > 0 && (
          <div
            className="relative flex shrink-0 items-center justify-center rounded-full border-2 border-[#0C1B26] bg-white/[0.06]"
            style={{
              width: size,
              height: size,
              marginLeft: -10,
              zIndex: 0,
            }}
          >
            <span className="text-[10px] font-medium text-[#F7F7F7]/60">
              +{remaining}
            </span>
          </div>
        )}
      </div>

      {showCount && (
        <p className="text-xs text-[#F7F7F7]/25">
          <span className="font-medium text-[#F7F7F7]/60">{players.length}</span>
          {totalSpots ? ` / ${totalSpots} joined` : " joined"}
          {spotsLeft > 0 && (
            <span> · {spotsLeft} spots left</span>
          )}
        </p>
      )}
    </div>
  );
}
