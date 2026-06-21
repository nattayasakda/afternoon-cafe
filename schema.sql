CREATE TABLE public.reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_code TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    booking_date DATE NOT NULL,
    time_slot TIME NOT NULL,
    pax INTEGER NOT NULL DEFAULT 1,
    note TEXT,
    status TEXT NOT NULL DEFAULT 'Booked' CHECK (status IN ('Booked', 'Arrived', 'No-show', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- เปิดการใช้งาน Row Level Security (RLS) เพื่อความปลอดภัย
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Policy 1: อนุญาตให้ลูกค้ายิง API มาเพิ่มข้อมูล (Insert) ได้อย่างเดียว
CREATE POLICY "Allow anonymous insert" ON public.reservations
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Policy 2: อนุญาตให้พนักงาน (คนที่ Login ผ่าน Supabase Auth) สามารถดูและแก้ไขข้อมูลได้ทั้งหมด
CREATE POLICY "Allow authenticated full access" ON public.reservations
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
