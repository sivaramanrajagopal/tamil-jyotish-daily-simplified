import type { NextConfig } from "next";
import { env } from "process";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    (env.REPLIT_DOMAINS || "http://localhost:3000").split(",")[0],
  ],
};

module.exports = nextConfig;
