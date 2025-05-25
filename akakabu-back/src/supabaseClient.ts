import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types/supabase.js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseRoleKey = process.env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient<Database>(supabaseUrl!, supabaseRoleKey!);

export default supabase;