-- ============================================
-- Import Mock Data to Supabase
-- ============================================

-- Import Rooms Data
INSERT INTO rooms (id, name, type, capacity, base_price, images, amenities) VALUES
('deluxe-city', 'Deluxe City View', 'Deluxe', 3, 3200, 
 ARRAY[
   'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80',
   'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
   'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80'
 ],
 ARRAY['Wi-Fi ความเร็วสูง', 'อาหารเช้าปรุงสด', 'บาร์เครื่องดื่ม', 'ทีวี HDR', 'มินิบาร์']),

('garden-suite', 'Garden Suite', 'Suite', 4, 4800,
 ARRAY[
   'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
   'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
   'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80'
 ],
 ARRAY['สระว่ายน้ำ', 'วิวสวน', 'ห้องแต่งตัว', 'เครื่องชงกาแฟ', 'เตียงคิงไซส์']),

('studio-loft', 'Studio Loft', 'Studio', 2, 2600,
 ARRAY[
   'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
   'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80',
   'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80'
 ],
 ARRAY['Wi-Fi ความเร็วสูง', 'ครัวขนาดเล็ก', 'บริการซักรีด', 'ชุดกาแฟ']),

('penthouse-sky', 'Penthouse Sky Lounge', 'Penthouse', 5, 6200,
 ARRAY[
   'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80',
   'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
   'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80'
 ],
 ARRAY['เลานจ์ส่วนตัว', 'วิวเมือง 360°', 'ห้องรับแขก', 'ห้องครัวครบ', 'บริการเชฟส่วนตัว']),

('executive-horizon', 'Executive Horizon', 'Executive', 2, 3800,
 ARRAY[
   'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
   'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80',
   'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80'
 ],
 ARRAY['ห้องน้ำสปา', 'Wi-Fi ความเร็วสูง', 'บริการรองเท้า', 'ชุดเครื่องครัว', 'บริการต้อนรับส่วนตัว']),

('standard-room', 'Standard Room', 'Standard', 2, 1800,
 ARRAY[
   'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80',
   'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80'
 ],
 ARRAY['Wi-Fi', 'ทีวี', 'ห้องน้ำส่วนตัว', 'เครื่องปรับอากาศ']),

('family-room', 'Family Room', 'Family', 6, 5500,
 ARRAY[
   'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
   'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80'
 ],
 ARRAY['Wi-Fi', 'ห้องนั่งเล่น', 'เตียงเสริม', 'ตู้เย็น', 'เครื่องชงกาแฟ']),

('honeymoon-suite', 'Honeymoon Suite', 'Suite', 2, 5200,
 ARRAY[
   'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
   'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80'
 ],
 ARRAY['ห้องน้ำสปา', 'วิวทะเล', 'เตียงคิงไซส์', 'ห้องนั่งเล่น', 'บริการพิเศษ']),

('business-suite', 'Business Suite', 'Executive', 2, 4200,
 ARRAY[
   'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
   'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80'
 ],
 ARRAY['โต๊ะทำงาน', 'Wi-Fi ความเร็วสูง', 'เครื่องพิมพ์', 'ห้องประชุมส่วนตัว', 'บริการธุรกิจ'])
ON CONFLICT (id) DO NOTHING;

-- Note: Bookings และ Users จะถูกสร้างผ่าน application
-- แต่ถ้าต้องการสร้าง test data สามารถใช้ SQL ด้านล่างได้
-- (ต้องมี user_id และ room_id ที่ถูกต้อง)

-- Example: สร้าง test booking (ต้องแก้ไข user_id และ room_id ให้ตรงกับข้อมูลจริง)
-- INSERT INTO bookings (id, room_id, user_id, room_name, guest_name, email, phone, check_in, check_out, nights, guests, total_price, status)
-- VALUES (
--   'BK001',
--   'deluxe-city',
--   'user-uuid-here', -- แทนที่ด้วย UUID ของ user จริง
--   'Deluxe City View',
--   'สมชาย ใจดี',
--   'somchai@example.com',
--   '081-234-5678',
--   '2025-01-15',
--   '2025-01-17',
--   2,
--   2,
--   6400,
--   'confirmed'
-- );

