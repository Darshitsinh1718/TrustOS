// src/components/UserAvatar.jsx
// Circular avatar component — shows user photo or initials fallback
// Supports sm, md, lg size variants

const SIZES = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
};

export default function UserAvatar({ user, size = "md", className = "" }) {
  const sizeClass = SIZES[size] || SIZES.md;

  // Generate initials from display name or email
  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "?";
  };

  if (user?.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt={user.displayName || "User avatar"}
        referrerPolicy="no-referrer"
        className={`${sizeClass} rounded-full object-cover border-2 border-slate-600
                    ring-2 ring-transparent hover:ring-cyan-500/40 transition-all ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center
                  bg-cyan-500/15 border-2 border-cyan-500/30 text-cyan-400
                  font-bold font-mono select-none ${className}`}
      aria-label={user?.displayName || "User avatar"}
    >
      {getInitials()}
    </div>
  );
}
