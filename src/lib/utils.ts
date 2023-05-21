import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  // dùng để merge lại các đoạn CSS với nhau.
  return twMerge(clsx(inputs));
}

export function chatHrefConstructor(id1: string, id2: string) {
  // tiến hành sort các ids như bên dưới và return nó lại một dạng như dòng số 11.
  const sortedIds = [id1, id2].sort();
  return `${sortedIds[0]}--${sortedIds[1]}`;
}
