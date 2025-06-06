// composables/useSupabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yykbeettvbazwlfckcdt.supabase.co' // ← thay bằng của bạn
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5a2JlZXR0dmJhendsZmNrY2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNzk2MzgsImV4cCI6MjA2NDc1NTYzOH0.RY3PPn6Yjwl9Eia5mwICtSC3-BqL3VsnMFVkJHdcaYk'    // ← thay bằng của bạn

export const supabase = createClient(supabaseUrl, supabaseKey)
