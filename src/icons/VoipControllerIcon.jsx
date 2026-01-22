const VoipControllerIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Server/rack with phone symbol */}
    <rect x="4" y="3" width="16" height="18" rx="1" stroke={color} strokeWidth="2" />
    <line x1="4" y1="9" x2="20" y2="9" stroke={color} strokeWidth="2" />
    <line x1="4" y1="15" x2="20" y2="15" stroke={color} strokeWidth="2" />
    <circle cx="12" cy="6" r="1" fill={color} />
    <circle cx="12" cy="12" r="1" fill={color} />
    <path d="M10 17 Q12 19 14 17" stroke={color} strokeWidth="1.5" fill="none" />
  </svg>
);

export default VoipControllerIcon;
