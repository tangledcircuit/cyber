import { AppProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

const THEME_SCRIPT = `
if (typeof localStorage !== 'undefined') {
  const theme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
}
`;

export default function App({ Component }: AppProps) {
  return (
    <html>
      <Head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
        <script id="theme-script">{THEME_SCRIPT}</script>
      </Head>
      <body>
        <Component />
      </body>
    </html>
  );
}
