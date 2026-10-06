import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="nebula-card overflow-hidden">
      <div className="aspect-square bg-background-secondary animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-1/3 bg-background-secondary rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-background-secondary rounded animate-pulse" />
        <div className="h-3 w-1/4 bg-background-secondary rounded animate-pulse" />
        <div className="h-8 w-full bg-background-secondary rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CosmicLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-accent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      <p className="mt-4 text-sm text-muted-foreground animate-pulse">Loading the galaxy...</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {Icon && (
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 rounded-full nebula-gradient opacity-10 blur-2xl" />
          <div className="relative w-24 h-24 rounded-full glass flex items-center justify-center">
            <Icon className="w-10 h-10 text-primary" />
          </div>
        </div>
      )}
      <h3 className="text-xl font-heading font-semibold text-foreground mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}