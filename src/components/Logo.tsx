import { Film } from "lucide-react";

export const Logo = ({ size = "default" }: { size?: "default" | "large" }) => {
  const dim = size === "large" ? "h-10 w-10" : "h-7 w-7";
  const text = size === "large" ? "text-3xl" : "text-xl";
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${dim} rounded-md bg-gradient-amber flex items-center justify-center glow-amber`}>
        <Film className={size === "large" ? "h-6 w-6" : "h-4 w-4"} strokeWidth={2.5} />
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-display ${text} tracking-wider`}>
          LP<span className="text-gradient-amber">VISION</span>
        </span>
        <span className="mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mt-0.5">
          Studio
        </span>
      </div>
    </div>
  );
};
