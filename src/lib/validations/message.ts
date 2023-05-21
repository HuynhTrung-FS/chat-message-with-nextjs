import { z } from "zod";

// xác định tin nhắn có đúng định dạng hay ko
export const messageValidator = z.object({
  id: z.string(),
  senderId: z.string(),
  // ở đây chúng ta có thể tạo ra phạm vi cho đoạn text (nghĩa là có thể giới hạn số lượng ký tự là 2000) bằng ext: z.string().max(2000)
  text: z.string(),
  timestamp: z.number(),
});

// xác định đoạn tin nhắn có phải là một array message và trong mỗi message có đúng định dạng như ở phía trên (đã định nghĩa) hay ko
export const messageArrayValidator = z.array(messageValidator);

//infer là một utility function mà zod cho chúng ta để infer các type của các props trong messageValidator.
export type Message = z.infer<typeof messageValidator>;
