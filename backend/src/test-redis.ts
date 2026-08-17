import { redisConnection } from "./config/redis";

async function main() {
  const response = await redisConnection.ping();

  console.log("Redis response:", response);

  await redisConnection.quit();
}

main().catch((error) => {
  console.error("Redis connection failed:", error);
  process.exit(1);
});