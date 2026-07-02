import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lean production image for docker-compose: only the files needed to run
  // `node server.js` are copied into the runtime stage.
  output: "standalone",
};

export default nextConfig;
