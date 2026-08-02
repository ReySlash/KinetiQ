import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="lex h-dvh w-full flex-col gap-2 px-1 md:px-2 md:pb-2 md:pt-0">
      <header className="sticky top-0 z-100 bg-background flex h-14 items-center gap-3 border-b border-border/60">
        <div className="flex flex-col">
          <h1 className="text-lg font-bold leading-none">404 - Not Found</h1>
        </div>
      </header>
      <section className="flex flex-col justify-center items-center h-full gap-2 rounded-3xl border border-border/70 bg-card/80 p-2 shadow-sm md:p-3">
        <Card className="w-1/3">
          <CardContent className="flex flex-col items-center gap-2">
            <CardTitle>404 - Not Found</CardTitle>
            <CardDescription>
              The page you are looking for does not exist.
            </CardDescription>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href={"/"}>
              <Button variant={"default"}>Go back home</Button>
            </Link>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
