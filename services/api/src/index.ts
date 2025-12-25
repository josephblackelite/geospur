import express from "express";
import { routes } from "./routes";

const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use(routes);

const port = Number(process.env.PORT ?? 8080);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on :${port}`);
});
