import { z } from "zod";

export const driverSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z
    .string()
    .regex(
      /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
      "Số điện thoại không hợp lệ (VD: 0901234567)"
    ),
  gender: z.enum(["Male", "Female"], {
    required_error: "Vui lòng chọn giới tính",
  }),
  dateOfBirth: z.string().refine((val) => {
    const date = new Date(val);
    const today = new Date();
    const minDate = new Date("1950-01-01");
    return date <= today && date >= minDate;
  }, "Ngày sinh không hợp lệ"),
  address: z.string().min(5, "Địa chỉ quá ngắn"),
  licenseNumber: z.string().length(9, "Số GPLX phải có 9 chữ số"),
  licenseClass: z.string().min(1, "Chọn hạng bằng lái"),
  issueDate: z
    .string()
    .refine(
      (val) => new Date(val) <= new Date(),
      "Ngày cấp không được trong tương lai"
    ),
  expiryDate: z
    .string()
    .refine(
      (val) => new Date(val) > new Date(),
      "Hạn sử dụng phải lớn hơn hôm nay"
    ),
});

export type DriverFormData = z.infer<typeof driverSchema>;
