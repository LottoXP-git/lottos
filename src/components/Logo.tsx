import lotusLogo from "@/assets/lotus-logo.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img src={lotusLogo} alt="Lotus" className="h-10 w-auto" />
    </div>
  );
}
