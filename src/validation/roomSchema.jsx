import { z } from "zod";

export const roomSchema = z.object({
  name: z.string().min(2, "Room name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  pricePerNight: z
    .number({ invalid_type_error: "Price must be a number" })
    .min(0, "Price must be at least 0"),
  amenities: z.string().min(2, "Please enter some amenities"),
  roomType: z.enum(["Standard", "Family", "Suite", "Deluxe"], { errorMap: () => ({ message: "Please select a valid room type" }) }),
  isAvailable: z.boolean(),
  guestHouseId: z.string().min(1, "Please select a guest house"),
  bedCount: z
    .number({ invalid_type_error: "Bed Count must be a number" })
    .min(1, "There must be at least one bed")
    .max(10, "Maximum 10 beds allowed")
});