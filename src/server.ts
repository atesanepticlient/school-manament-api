import { app } from "./app";
import env from "dotenv";
import { connectDB } from "./config/db";

env.config();

const server = app.listen(8080, async () => {
  await connectDB();
  console.log("server is running at 8080");
});

server.on("error", (error: NodeJS.ErrnoException) => {
  console.error("Server failed to start:", error);

  if (error.code === "EADDRINUSE") {
    console.error("Port 8080 is already in use.");
  }

  process.exit(1);
});



