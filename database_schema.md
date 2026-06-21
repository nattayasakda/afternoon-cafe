# Supabase Database Schema
**สำหรับระบบรับจองโต๊ะร้านกาแฟ (Coffee Shop Table Reservation System)**

---

## 1. ชื่อตาราง (Table Name)
`bookings` 
(เก็บข้อมูลการจองทั้งหมดของลูกค้า)

---

## 2. โครงสร้างคอลัมน์ (Columns & Types)

| Column Name | Data Type (Supabase/PostgreSQL) | Constraints / Default Value | คำอธิบาย |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **Primary Key**, Default: `uuid_generate_v4()` | รหัสอ้างอิงหลักของตาราง |
| `reference_code` | `text` | **Unique**, Required | รหัสการจองแบบสั้นให้ลูกค้าจำง่าย (เช่น BNC-1001) |
| `customer_name` | `text` | Required | ชื่อของลูกค้าที่ทำการจอง |
| `phone_number` | `text` | Required | เบอร์โทรศัพท์ลูกค้า |
| `booking_date` | `date` | Required | วันที่ลูกค้าจะเข้ามาใช้บริการ |
| `time_slot` | `time` | Required | เวลารอบที่จอง (เช่น 09:00:00) |
| `pax` | `integer` | Required, Default: `1` | จำนวนคน |
| `note` | `text` | Nullable (Optional) | หมายเหตุหรือคำขอพิเศษ |
| `status` | `text` (หรือ `enum` ก็ได้) | Default: `'Booked'` | สถานะ: `Booked`, `Arrived`, `No-show`, `Cancelled` |
| `created_at` | `timestamptz` | Default: `now()` | เวลาที่ทำการจองเข้ามา |

*(หากมีระบบจัดการหลายสาขาในอนาคต อาจต้องเพิ่มคอลัมน์ `branch_id`)*

---

## 3. ข้อมูลตัวอย่าง (Sample Data)

| id | reference_code | customer_name | phone_number | booking_date | time_slot | pax | note | status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| *uuid-1* | BNC-1001 | สมชาย ใจดี | 081-111-1111 | 2026-06-22 | 09:00:00 | 2 | ขอโต๊ะริมหน้าต่าง | Booked |
| *uuid-2* | BNC-1002 | สมหญิง รักดี | 082-222-2222 | 2026-06-22 | 11:00:00 | 4 | มีเด็กเล็กมาด้วย 1 คน | Arrived |
| *uuid-3* | BNC-1003 | จอห์น สมิธ | 083-333-3333 | 2026-06-22 | 13:00:00 | 1 | - | No-show |
| *uuid-4* | BNC-1004 | แมรี่ เจน | 084-444-4444 | 2026-06-23 | 09:00:00 | 2 | แพ้นมวัว | Booked |
| *uuid-5* | BNC-1005 | ปีเตอร์ พาร์ก | 085-555-5555 | 2026-06-23 | 15:00:00 | 6 | ต้องการโต๊ะยาว | Cancelled |

---

## 4. คำแนะนำการอ่าน/เขียนข้อมูลผ่านหน้าเว็บ (Best Practices for Supabase)

### 🟢 ฝั่งลูกค้า (Customer Web - การจองโต๊ะ)
- **การเช็คคิวว่าง (Read):**
  หน้าเว็บควรส่งคำสั่ง Query เพื่อนับจำนวนคิวในวันและเวลานั้นๆ ก่อน เช่น
  ```javascript
  const { count } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('booking_date', '2026-06-22')
    .eq('time_slot', '09:00:00')
    .in('status', ['Booked', 'Arrived']);
  ```
  หาก `count` ถึงกำหนดสูงสุดที่ร้านรับได้ (เช่น 5 โต๊ะ) ปุ่มเลือกเวลานั้นควรขึ้นสถานะ Disabled
- **การบันทึกการจอง (Write/Insert):**
  ใช้คำสั่ง `insert` พร้อมส่งข้อมูลลูกค้าเข้าไป (ระบบจะสร้าง `id` และ `created_at` ให้อัตโนมัติ)
- **ความปลอดภัย (RLS - Row Level Security):**
  สำหรับฝั่งลูกค้าซึ่งเป็นการทำธุรกรรมแบบไม่เข้าสู่ระบบ (Anonymous / Guest) ควรตั้งค่า RLS ใน Supabase ให้ `Role: anon` สามารถ **INSERT ได้อย่างเดียว** (ไม่ให้สิทธิ์ SELECT/UPDATE) เพื่อป้องกันไม่ให้ใครดึงข้อมูลส่วนตัวของลูกค้ารายอื่นออกไปดูได้

### 🔵 ฝั่งพนักงาน (Staff Admin - ระบบจัดการ)
- **การยืนยันตัวตน (Authentication):**
  หน้า Admin ต้องบังคับให้พนักงาน Login ผ่าน Supabase Auth ก่อน (เช่นใช้อีเมลพนักงาน)
- **การดึงข้อมูล (Read):**
  เมื่อเข้าหน้า Dashboard ระบบจะ Query คิวของวันนี้มาแสดง
  ```javascript
  const { data } = await supabase
    .from('bookings')
    .select('*')
    .eq('booking_date', '2026-06-22')
    .order('time_slot', { ascending: true });
  ```
- **การอัปเดตสถานะคิว (Update):**
  เมื่อลูกค้ามาถึง พนักงานกดปุ่ม [Arrived]
  ```javascript
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'Arrived' })
    .eq('id', bookingId);
  ```
- **ความปลอดภัย (RLS):**
  ตั้งสิทธิ์ให้ Role ที่ทำการ Authenticated แล้ว (พนักงาน) สามารถเข้าถึงคำสั่ง `SELECT`, `INSERT`, `UPDATE` ได้แบบ Full Access
