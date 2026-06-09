import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDb } from "./config/db.js";

dotenv.config();

const port = process.env.PORT || 5000;

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Workevn API running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start Workevn API", error);
    process.exit(1);
  });
