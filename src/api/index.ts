import { Hono } from "hono";
 
const app = new Hono();
 
app.get("/hello", (c) => {
  return c.text("Hello, world!");
});
 
export default app;