import { z } from "zod";
// xác thực email có phải đúng định dạng không
// tạo thử một biến const random và nếu chúng ta parse with this random object với validator email nó sẽ fail bởi vì
// cái object random này không đúng định dạng email.

// có thể hiểu là email phải là string và phải đúng định dạng email

// addFriendValidator là một schema
export const addFriendValidator = z.object({
  email: z.string().email(),
});
