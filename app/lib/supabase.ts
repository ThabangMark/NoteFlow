import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DBProfile {
  id: string; name: string; role: "student" | "tutor" | "admin";
  avatar: string; university: string | null; created_at: string;
}
export interface DBStudentProfile {
  id: string; course: string | null; year: string;
  plan: "free" | "premium"; referral_code: string; referred_by: string | null;
}
export interface DBTutorProfile {
  id: string; modules: string[]; qualifications: string[]; bio: string | null;
  rate: number; available: boolean; rating: number; review_count: number;
  verified: "pending" | "approved" | "rejected"; earnings: number;
}
export interface DBMaterial {
  id: number; title: string; type: "Notes" | "Exam Paper" | "Summary" | "Textbook";
  module: string; university: string; field: string; year_level: string | null;
  pages: number | null; premium: boolean; file_url: string | null;
  uploaded_by: string | null; downloads: number; rating: number;
  review_count: number; created_at: string;
}
export interface DBBooking {
  id: number; student_id: string; tutor_id: string;
  student_name: string; tutor_name: string; module: string;
  date: string; time: string; status: "pending" | "confirmed" | "completed" | "cancelled";
  note: string | null; amount: number; created_at: string;
}
export interface DBMessage {
  id: number; sender_id: string; receiver_id: string;
  sender_name: string; text: string; read: boolean; created_at: string;
}
export interface DBReview {
  id: number; student_id: string; tutor_id: string;
  student_name: string; tutor_name: string; rating: number;
  comment: string | null; flagged: boolean; hidden: boolean; created_at: string;
}
export interface DBPayment {
  id: number; student_id: string; tutor_id: string; booking_id: number;
  student_name: string; tutor_name: string; amount: number;
  status: "completed" | "pending" | "refunded"; method: string; created_at: string;
}
export interface DBMaterialRating {
  id: number; material_id: number; student_id: string;
  rating: number; comment: string | null; created_at: string;
}