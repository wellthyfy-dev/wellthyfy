import {
  Briefcase,
  Compass,
  Flower2,
  GraduationCap,
  Handshake,
  HeartPulse,
  House,
  Rocket,
  Sparkles,
  Sun,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const registry: Record<string, LucideIcon> = {
  heart: HeartPulse,
  wallet: Wallet,
  sun: Sun,
  flower: Flower2,
  compass: Compass,
  graduation: GraduationCap,
  users: Users,
  handshake: Handshake,
  briefcase: Briefcase,
  home: House,
  rocket: Rocket,
  sparkles: Sparkles,
};

export function Icon({
  name,
  className,
  strokeWidth = 1.75,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  const Cmp = registry[name] ?? Sparkles;
  return <Cmp className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}
