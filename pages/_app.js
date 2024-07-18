import "@/styles/globals.css";

import Header from "../components/Header";

import { Raleway } from "next/font/google";

const inter = Raleway({ subsets: ["latin"], weight: "400" });


export default function App({ Component, pageProps }) {
  return <>
      <main className={`${inter.className} min-h-screen max-w-screen-2xl mx-auto bg-background text-text`}>
        <Header />
        <Component {...pageProps} />;
      </main>
    </>;
  
}
