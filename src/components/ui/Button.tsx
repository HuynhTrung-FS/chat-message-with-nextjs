import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, FC } from "react";

// buttonVariants sẽ là một anonymous function
// cva sẽ nhận 2 biến (biến đầu tiên là classValue, biến thứ hai là object gồm 3 thuộc tính variants, defaultVariants)
export const buttonVariants = cva(
  "active:scale-95 inline-flex items-center justify-center just rounded-md text-sm font-medium transition-color focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-white hover:bg-slate-800",
        ghost: "bg-transparent hover:text-slate-900 hover:bg-slate-200",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-2",
        lg: "h-11 px-8 ",
      },
    },
    defaultVariants: {
      // các giá trị trong defaultVariants là mình truy xuất từ props default trong variant mình định nghĩa chỗ variants
      variant: "default",
      size: "default",
    },
  }
);
const a = () => {};
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}
const Button: FC<ButtonProps> = ({
  className,
  children,
  variant,
  isLoading,
  size,
  ...props
}) => {
  return (
    <button
      // cả 3 thuộc tính này là các props
      // merge css lại với nhau (merge variant, size và các css khác nếu có (chỗ className sẽ là các css khi thêm từ bên ngoài))
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
};

export default Button;
