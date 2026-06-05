import { z } from "zod";

// Arabic + Latin letters, spaces, hyphens, apostrophes; 2–60 chars
export const nameSchema = z
  .string()
  .trim()
  .min(2, { message: "الاسم يجب أن يكون حرفين على الأقل" })
  .max(60, { message: "الاسم طويل جداً" })
  .regex(/^[\p{L}\s'’\-.]+$/u, { message: "الاسم يحتوي على رموز غير صالحة" });

// Egyptian mobile: exactly 11 digits (e.g. 01xxxxxxxx)
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\d{11}$/, { message: "رقم الهاتف يجب أن يكون 11 رقماً بالضبط" });

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "تاريخ غير صالح" });

export const futureDateSchema = dateSchema.refine(
  (s) => {
    const d = new Date(s + "T23:59:59");
    return d.getTime() >= new Date().setHours(0, 0, 0, 0);
  },
  { message: "لا يمكن الحجز في يوم سابق" },
);

export const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, { message: "وقت غير صالح" });

export const serviceIdSchema = z
  .string()
  .min(1, { message: "اختر خدمة" });

export const statusSchema = z.enum(["confirmed", "waiting", "canceled"]);

export const bookingSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  date: futureDateSchema,
  time: timeSchema,
  serviceId: serviceIdSchema,
});

export const adminAppointmentSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  date: dateSchema,
  time: timeSchema,
  serviceId: serviceIdSchema,
  status: statusSchema,
});

export const serviceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "اسم الخدمة قصير جداً" })
    .max(60, { message: "اسم الخدمة طويل جداً" }),
  durationMin: z
    .number({ invalid_type_error: "المدة يجب أن تكون رقم" })
    .int({ message: "المدة يجب أن تكون رقم صحيح" })
    .min(5, { message: "المدة دقائق على الأقل 5" })
    .max(480, { message: "المدة أكثر من اللازم" }),
  price: z
    .number({ invalid_type_error: "السعر يجب أن يكون رقم" })
    .min(0, { message: "السعر لا يمكن أن يكون سالب" })
    .max(1_000_000, { message: "السعر غير منطقي" }),
});

export const settingsSchema = z.object({
  salonName: z.string().trim().min(2, { message: "اسم الصالون قصير" }).max(80),
  ownerName: nameSchema,
  workingHours: z
    .object({ start: timeSchema, end: timeSchema })
    .refine((v) => v.start < v.end, { message: "نهاية العمل يجب أن تكون بعد البداية", path: ["end"] }),
});

// Helper: get first error message from a ZodError safely
export function firstError(err: z.ZodError): string {
  return err.errors[0]?.message ?? "بيانات غير صالحة";
}
