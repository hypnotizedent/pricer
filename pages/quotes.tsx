import { useSession } from "next-auth/react";
import QuoteList from "../components/QuoteList";

export default function QuotesPage() {
  const { data: session } = useSession();
  if (!session) return <p>Please sign in.</p>;
  return <QuoteList userId={session.user.id} />;
}
