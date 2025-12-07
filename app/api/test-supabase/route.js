import { supabase } from "@/utils/supabase";

export async function GET() {
  const { data, error } = await supabase.from("users").select("*").limit(1);

  return Response.json({
    status: error ? "error" : "success",
    data,
    error
  });
}
