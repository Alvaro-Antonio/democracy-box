import Image from "next/image";

import { cn } from "@/lib/utils";
import type { Candidate } from "@/types/domain";

interface CandidateAvatarProps {
  candidate: Pick<Candidate, "name" | "photoUrl">;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-lg",
  xl: "size-24 text-2xl font-bold",
};

export function CandidateAvatar({ candidate, size = "md", className }: CandidateAvatarProps) {
  const initials = candidate.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  if (candidate.photoUrl) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-full border border-border/60 bg-muted shrink-0",
          sizeClasses[size],
          className,
        )}
      >
        <Image
          src={candidate.photoUrl}
          alt={`Foto de ${candidate.name}`}
          fill
          sizes="(max-width: 768px) 100px, 150px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      aria-label={`Iniciais de ${candidate.name}`}
      className={cn(
        "flex items-center justify-center rounded-full bg-primary/10 text-primary font-medium border border-primary/20 shrink-0 select-none",
        sizeClasses[size],
        className,
      )}
    >
      {initials || "?"}
    </div>
  );
}
