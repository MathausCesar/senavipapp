import dynamic from "next/dynamic";

export function withProtectedRoute(
  Component: React.ComponentType<any>
) {
  return dynamic(() => Promise.resolve(Component), {
    ssr: false,
  });
}
