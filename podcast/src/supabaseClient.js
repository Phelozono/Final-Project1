// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kkjjgmwpvhciazljrfst.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrampnbXdwdmhjaWF6bGpyZnN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDExNTg2NDcsImV4cCI6MjAxNjczNDY0N30.X8AiT_y_vnMTtsRbwua_QGxa3ozf-eAqu7w8dZWip70'
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
