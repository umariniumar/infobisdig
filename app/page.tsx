import Dashboard from "../components/Dashboard";
import { getBoard } from "../lib/data";

export const dynamic = "force-dynamic";

export default async function Page() {
  const board = await getBoard();
  return <Dashboard initialBoard={board} />;
}
