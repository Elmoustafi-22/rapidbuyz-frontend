import "@/styles/globals.css";
import Header from "../components/Header";
import { Raleway } from "next/font/google";
import { CartContextProvider } from "@/lib/CartContext";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";

const inter = Raleway({ subsets: ["latin"], weight: "400" });


export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <>
      <SessionProvider session={session}>
        <CartContextProvider>
          <main
            className={`${inter.className} min-h-screen max-w-screen-2xl mx-auto bg-background text-text`}
          >
            <Header />
            <Component {...pageProps} />;
            <Toaster position="top-center" reverseOrder={false} />
          </main>
        </CartContextProvider>
      </SessionProvider>
    </>
  );
  
}
