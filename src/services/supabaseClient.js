// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rvwvhnmcrcxcsuvtesoi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2d3Zobm1jcmN4Y3N1dnRlc29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjQ1NTQsImV4cCI6MjA5MjkwMDU1NH0.eqQM3RoEUrhU33FxeEFFl5zOWel4URqrdCKXmsRzikU'; // Ganti dengan anon key kamu

export const supabase = createClient(supabaseUrl, supabaseAnonKey);