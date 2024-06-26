import "./globals.css";
import App from "./App.svelte";

const app = new App({
  // biome-ignore lint/style/noNonNullAssertion: nope
  target: document.getElementById("app")!,
});

export default app;
