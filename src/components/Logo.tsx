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
        {/* Top leaf - Green */}
        <path
          d="M22 4C22 4 16 10 16 16C16 19 18 22 22 22C26 22 28 19 28 16C28 10 22 4 22 4Z"
          fill="#00A19A"
        />
        
        {/* Right leaf - Blue */}
        <path
          d="M40 22C40 22 34 16 28 16C25 16 22 18 22 22C22 26 25 28 28 28C34 28 40 22 40 22Z"
          fill="#0056A4"
        />
        
        {/* Bottom leaf - Orange */}
        <path
          d="M22 40C22 40 28 34 28 28C28 25 26 22 22 22C18 22 16 25 16 28C16 34 22 40 22 40Z"
          fill="#F7941D"
        />
        
        {/* Left leaf - Yellow/Gold */}
        <path
          d="M4 22C4 22 10 28 16 28C19 28 22 26 22 22C22 18 19 16 16 16C10 16 4 22 4 22Z"
          fill="#FFD700"
        />
        
        {/* Center circle */}
        <circle cx="22" cy="22" r="4" fill="white" />
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
