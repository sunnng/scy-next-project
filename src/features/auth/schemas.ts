import { z } from "zod";

// 密码熵计算函数
function calculatePasswordEntropy(password: string) {
  // 定义更广泛的字符集（包含更多特殊符号）
  const charCategories = [
    { regex: /[a-z]/, size: 26 }, // 小写字母
    { regex: /[A-Z]/, size: 26 }, // 大写字母
    { regex: /\d/, size: 10 }, // 数字
    { regex: /[!@#$%^&*()_+{}[\]:;<>?,./-]/, size: 30 }, // 扩展特殊符号
  ];

  // 计算实际使用的字符集大小
  const charsetSize = charCategories.reduce(
    (sum, { regex, size }) => (regex.test(password) ? sum + size : sum),
    0
  );

  // 熵值公式：E = L * log2(N)
  return password.length * Math.log2(charsetSize || 1);
}

// 共用邮箱验证
const emailSchema = z
  .string()
  .min(1, "邮箱不能为空")
  .email("无效的邮箱格式")
  .regex(/^[\w.%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i, "包含无效字符");

export const signUpSchema = z.object({
  name: z
    .string()
    .min(1, "用户名不能为空")
    .min(2, "用户名至少2个字符")
    .max(20, "用户名最长20个字符")
    // 允许中文、字母、数字及常用符号（新增中文支持）
    .regex(/^[\p{L}0-9_\-.]+$/u, "允许中文、字母、数字、_、-、.")
    // 更精确的空格检测（包括全角空格）
    .regex(/^\S*$/, "不能包含任何空格")
    .transform((str) => str.trim())
    // 禁止纯数字用户名（新增防御规则）
    .refine((val) => !/^\d+$/.test(val), {
      message: "不能使用纯数字作为用户名",
    }),

  email: emailSchema,

  password: z
    .string()
    .min(1, "密码不能为空")
    .min(8, "密码至少需要8个字符") // 修改为8字符
    .max(64, "密码最长64个字符")
    .regex(/(?=.*[a-z])/, "必须包含小写字母")
    .regex(/(?=.*[A-Z])/, "必须包含大写字母")
    .regex(/(?=.*\d)/, "必须包含数字")
    .regex(/(?=.*[!@#$%^&*()_+{}[\]:;<>?,./-])/, "必须包含特殊符号")
    .refine((password) => calculatePasswordEntropy(password) >= 60, {
      message: "密码强度不足",
      params: {
        tips: [
          "8字符密码需满足：",
          "- 必须包含大小写字母 + 数字 + 特殊符号",
          "- 示例：P@ssw0rd!",
        ],
      },
    }),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "密码不能为空").max(64, "密码过长"), // 可选：防止超长输入攻击
});

// 类型推导
export type SignInFormData = z.infer<typeof signInSchema>;
