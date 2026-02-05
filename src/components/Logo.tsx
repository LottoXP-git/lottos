export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Lotus Flower Icon */}
      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
      >
        {/* Center petal - Orange */}
        <path
          d="M22 6C22 6 26 12 26 18C26 24 22 28 22 28C22 28 18 24 18 18C18 12 22 6 22 6Z"
          fill="url(#orangeGradient)"
        />
        
        {/* Left petal - Teal */}
        <path
          d="M10 16C10 16 16 16 20 20C24 24 24 30 24 30C24 30 18 30 14 26C10 22 10 16 10 16Z"
          fill="url(#tealGradient)"
        />
        
        {/* Right petal - Blue */}
        <path
          d="M34 16C34 16 28 16 24 20C20 24 20 30 20 30C20 30 26 30 30 26C34 22 34 16 34 16Z"
          fill="url(#blueGradient)"
        />
        
        {/* Bottom left accent - Orange */}
        <circle cx="14" cy="32" r="3" fill="#F7941D" opacity="0.9" />
        
        {/* Bottom right accent - Blue */}
        <circle cx="30" cy="32" r="3" fill="#0056A4" opacity="0.9" />
        
        {/* Center dot */}
        <circle cx="22" cy="22" r="3" fill="#00A19A" />
        
        <defs>
          <linearGradient id="orangeGradient" x1="22" y1="6" x2="22" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFB347" />
            <stop offset="1" stopColor="#F7941D" />
          </linearGradient>
          <linearGradient id="tealGradient" x1="10" y1="16" x2="24" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00C9B8" />
            <stop offset="1" stopColor="#00A19A" />
          </linearGradient>
          <linearGradient id="blueGradient" x1="34" y1="16" x2="20" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4A90D9" />
            <stop offset="1" stopColor="#0056A4" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Logo Text */}
      <span className="text-2xl font-bold tracking-tight">
        <span style={{ color: '#0056A4' }}>Lo</span>
        <span style={{ color: '#F7941D' }}>t</span>
        <span style={{ color: '#00A19A' }}>us</span>
      </span>
    </div>
  );
}
