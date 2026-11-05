import { useRouterState } from "@tanstack/react-router";

export function NavigationProgress() {
  const isLoading = useRouterState({ select: (state) => state.isLoading });

  if (!isLoading) return null;

  return (
    <div
      className="navigation-progress"
      role="progressbar"
      aria-label="Loading page"
    />
  );
}
