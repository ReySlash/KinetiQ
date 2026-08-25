import StyledLink from "@/components/styled-link";

export default function NotFound() {
  return (
    <main className="flex h-dvh w-full flex-col items-center justify-center gap-4 px-4 pb-13 text-center">
      <h1 className="font-semibold">Workout session not found</h1>
      <StyledLink href="/workout-sessions" variant="outline">Back to workout history</StyledLink>
    </main>
  );
}
