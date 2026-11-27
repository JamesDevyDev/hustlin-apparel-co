import { redirect } from "next/navigation";

// The landing page is built later; for now the shop is the front door.
export default function HomePage() {
  redirect("/shop");
}
