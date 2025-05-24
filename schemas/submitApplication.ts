import { z } from 'zod'

export const submitApplicationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  position: z.string().min(1, "Position is required"),
  resume: z.string().url("Invalid resume URL"),
  // Add other fields as necessary
})

export type SubmitApplicationInput = z.infer<typeof submitApplicationSchema>
