import { fetchRedis } from "./redis";

export const getFriendsByUserId = async (userId: string) => {
  // retrieve friends for current user.
  //   lấy tất cả id của các friends.
  const friendIds = (await fetchRedis(
    "smembers",
    `user:${userId}:friends`
  )) as string[];

  // nhờ vào array id mà chúng ta có thể lấy được array thông tin của các friends liên quan đến user.
  const friends = await Promise.all(
    friendIds.map(async (friendId) => {
      const friend = (await fetchRedis("get", `user:${friendId}`)) as string;
      const parsedFriend = JSON.parse(friend) as UserA;
      return parsedFriend;
    })
  );
  return friends;
};
