import type { AppProps } from 'next/app';
import '../styles/aboutus.css';
import '../styles/gameplay.css';
import '../styles/header_and_nav.css';
import '../styles/home.css';
import '../styles/login.css';
import '../styles/mygames.css';
import '../styles/profile.css';
import '../styles/stats.css';
import '../styles/text_field_with_error.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}