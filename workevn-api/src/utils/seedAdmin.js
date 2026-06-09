import dotenv from "dotenv";
import { connectDb } from "../config/db.js";
import { User } from "../models/User.js";

dotenv.config();

async function seedAdmin() {
  await connectDb();

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
  }

  const existingAdmin = await User.findOne({ email });

  if (existingAdmin) {
    console.log(`Admin already exists: ${email}`);
    process.exit(0);
  }

  const passwordHash = await User.hashPassword(password);
  await User.create({
    name: process.env.ADMIN_NAME || "Workevn Admin",
    email,
    phone: "0000000000",
    passwordHash,
    role: "admin"
  });

  console.log(`Admin created: ${email}`);
  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
