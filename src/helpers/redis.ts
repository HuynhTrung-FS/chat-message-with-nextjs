const upstashRedisRestUrl = process.env.UPSTASH_REDIS_REST_URL;
const authToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// sismember dùng để check value là một part của 1 list in redis
type Commands = "zrange" | "sismember" | "get" | "smembers";

export async function fetchRedis(
  command: Commands,
  ...args: (string | number)[]
) {
  const commandUrl = `${upstashRedisRestUrl}/${command}/${args.join("/")}`;
  const response = await fetch(commandUrl, {
    headers: {
      // cần phải gửi header này để được authorization bên phía upstash redis. (được truy cập vào database và xử lý query).
      Authorization: `Bearer ${authToken}`,
    },
    // no-store meaning the data is never going to be stale (dữ liệu sẽ không bao giờ cũ)
    // vì ở đây là một get request, và nó ko cần storing the result và always delivering fresh data.
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Error executing Redis command: ${response.statusText}`);
  }
  const data = await response.json();
  return data.result;
}
