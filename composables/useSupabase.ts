// composables/useSupabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cqqbxnpuuupakoskqllh.supabase.co' // ← thay bằng của bạn
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxcWJ4bnB1dXVwYWtvc2txbGxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMTQ4MjMsImV4cCI6MjA2Mjc5MDgyM30.dZ45bmG5wqbpjjDw8UWaUjaIzDhIqI1dsqL32_alUjE'    // ← thay bằng của bạn

export const supabase = createClient(supabaseUrl, supabaseKey)
