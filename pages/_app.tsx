import { SessionProvider } from "next-auth/react";
import { trpc } from "../utils/trpc";
import "../styles/globals.css";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <trpc.Provider>
        <Component {...pageProps} />
      </trpc.Provider>
    </SessionProvider>
  );
}
