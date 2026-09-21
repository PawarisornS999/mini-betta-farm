"use client";

import Link from "next/link";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon = "🐟",
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="text-center py-20">
      <p className="text-5xl mb-4">{icon}</p>
      <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
      {description && <p className="text-muted mb-6">{description}</p>}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-block bg-accent text-white px-8 py-3 rounded-2xl font-medium hover:bg-accent-dark transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
