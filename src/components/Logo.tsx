import lottosLogo from "@/assets/lottos-logo.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img src={lottosLogo} alt="Lottos" className="h-10 w-auto" />
    </div>
  );
}