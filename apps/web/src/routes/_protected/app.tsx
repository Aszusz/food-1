import { createFileRoute } from "@tanstack/react-router";
import { CookbookApp } from "../../features/CookbookApp";

export const Route = createFileRoute("/_protected/app")({
  component: CookbookApp,
});
