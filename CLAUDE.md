# Padelhive — Product Requirements Document

## 1. Overview

Padelhive adalah marketplace booking lapangan padel berbasis web yang menghubungkan pemain padel dengan berbagai venue. Pengguna dapat mencari venue, melihat ketersediaan lapangan secara real-time, melakukan booking, membayar secara online, mengundang teman bermain, dan membagi biaya booking.

Platform juga menyediakan dashboard untuk pemilik venue guna mengelola lapangan, jadwal, harga, dan reservasi. Super admin marketplace bertugas melakukan verifikasi venue, mengelola komisi, memantau transaksi, serta menangani dispute dan refund.

---

## 2. Goals

### Business Goals
- Menjadi marketplace booking padel utama di Indonesia.
- Mengakuisisi venue padel di Bali, Jakarta, dan Surabaya.
- Menghasilkan pendapatan melalui komisi transaksi.

### Product Goals
- Mempermudah proses booking lapangan dalam kurang dari 2 menit.
- Menampilkan ketersediaan lapangan secara real-time.
- Mengurangi double booking hingga mendekati 0%.

### Measurable Outcomes
- 1.000 booking berhasil dalam 3 bulan pertama.
- Conversion rate booking > 15%.
- Booking completion rate > 90%.
- Venue retention > 80%.
- Rating produk > 4.5/5.

---

## 3. Target Users

### Player (Pemain Padel)
- Menemukan venue dengan cepat.
- Melihat slot tersedia secara real-time.
- Booking dan bayar secara online.
- Mengajak teman bermain.
- Membagi biaya booking.

### Venue Owner
- Mengelola venue dan lapangan.
- Mengatur harga dan jadwal operasional.
- Memantau booking dan pendapatan.

### Venue Admin
- Mengelola operasional harian venue.
- Memproses booking.
- Memantau jadwal court.

### Marketplace Super Admin
- Verifikasi venue.
- Mengatur komisi marketplace.
- Memantau transaksi.
- Menangani refund dan dispute.

---

## 4. Tech Stack

### Frontend (Web)
- Next.js 15
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion

### Backend
- NestJS (Node.js)
- REST API
- WebSocket (Socket.IO)

### Database
- PostgreSQL

### ORM
- Prisma

### Authentication
- Firebase Authentication
- Google Login
- OTP Login

### Storage
- AWS S3

### Payments
- Midtrans
- Xendit

### Infrastructure
- AWS
- Docker
- GitHub Actions
- CloudFront CDN

### Analytics
- Google Analytics
- Firebase Analytics
- Crashlytics (future mobile app)

---

## 5. Core Features

### MVP (Must Have)

#### User Authentication
- Google Login
- OTP Login
- Session management

#### Venue Discovery
- Browse venue tanpa login
- Search venue
- Filter kota
- Detail venue
- Foto venue dan fasilitas

#### Visual Availability Calendar
- Kalender interaktif
- Slot per jam
- Real-time availability
- Status court live

#### Court Booking
- Pilih venue
- Pilih court
- Pilih tanggal
- Pilih jam
- Konfirmasi booking

#### Online Payment
- Midtrans/Xendit
- VA
- E-wallet
- Kartu kredit/debit

#### Booking Management
- Riwayat booking
- Detail booking
- Cancel booking
- Status booking

#### Refund Management
- Full refund sebelum H-1
- Non-refundable setelah H-1

#### Invite Friends
- Share link
- RSVP kehadiran
- Daftar peserta

#### Split Payment
- Bagi biaya booking
- Tracking pembayaran peserta

#### Venue Owner Dashboard
- Kelola venue
- Kelola court
- Kelola pricing
- Kelola jam operasional
- Monitoring booking
- Monitoring pendapatan

#### Dynamic Pricing
- Peak pricing
- Off-peak pricing
- Weekday pricing
- Weekend pricing

#### Promo & Voucher
- Voucher code
- Diskon nominal
- Diskon persentase

#### Super Admin Dashboard
- Approve venue
- Reject venue
- Monitoring transaksi
- Monitoring booking
- Pengaturan komisi
- Refund & dispute handling

### Nice to Have
- Rental raket
- Rental bola
- Ratings & reviews
- Push notifications
- In-app chat
- Tournament module
- Loyalty program
- AI venue recommendations
- Social/community features

---

## 6. Out of Scope

- Marketplace perlengkapan olahraga
- Streaming pertandingan
- Wearable integration
- Multi-country launch
- Native mobile apps (fase pertama)

---

## 7. User Flows

### Booking Court
1. Buka website.
2. Browse venue.
3. Pilih venue.
4. Lihat kalender ketersediaan.
5. Pilih court.
6. Pilih tanggal dan jam.
7. Login.
8. Checkout.
9. Bayar.
10. Booking berhasil.

### Invite Friends
1. Booking berhasil.
2. Generate invite link.
3. Share link.
4. Teman RSVP.
5. Split payment jika diperlukan.

### Venue Management
1. Owner login.
2. Tambah venue.
3. Tambah court.
4. Atur pricing.
5. Submit untuk approval.
6. Venue aktif.

---

## 8. Data Model

### User
- id
- role
- name
- email
- phone

### Venue
- id
- owner_id
- name
- location
- description

### Court
- id
- venue_id
- name

### Booking
- id
- user_id
- court_id
- booking_date
- start_time
- end_time
- status

### Payment
- id
- booking_id
- amount
- status
- provider

### Invite
- id
- booking_id
- user_id
- attendance_status

### Voucher
- id
- code
- type
- value

### Refund
- id
- booking_id
- amount
- status

---

## 9. UI/UX Notes

### Design Direction
- Modern sports-tech marketplace
- Mobile-first responsive web
- Premium dan energetic

### Visual Style
- Glassmorphism accents
- Smooth micro-interactions
- Framer Motion animations
- Real-time visual indicators

### Key UX Goals
- Booking maksimal 3–4 langkah
- Fast-loading experience
- Real-time updates tanpa refresh
- Optimized untuk mobile browser

---

## 10. Technical Considerations

### Real-Time Availability
- Socket.IO untuk update slot live

### Concurrency Control
- Temporary booking lock saat checkout
- Auto-release jika pembayaran timeout

### Security
- JWT Authentication
- RBAC (Role-Based Access Control)
- Secure payment webhook verification

### Performance
- Server-side rendering (SSR)
- Incremental Static Regeneration (ISR)
- CDN caching

---

## 11. Success Metrics

### User Metrics
- MAU > 10.000
- D30 Retention > 30%
- Booking completion > 90%

### Business Metrics
- GMV bulanan
- Revenue komisi
- Jumlah venue aktif

### Operational Metrics
- Uptime > 99.9%
- Double booking = 0
- Payment success rate > 95%

---

## 12. Open Questions

- Besaran komisi marketplace.
- Service fee pengguna.
- SLA dispute resolution.
- KYC venue owner.
- Strategi akuisisi venue awal.

---

## 13. Assumptions

1. Nama produk diubah menjadi **Padelhive**.
2. MVP dibangun sebagai **web application terlebih dahulu** untuk mempercepat time-to-market.
3. Frontend menggunakan **Next.js + TypeScript** karena mendukung SEO, performa tinggi, SSR, dan skalabilitas marketplace.
4. UI menggunakan **Tailwind CSS + shadcn/ui** sebagai standar modern SaaS marketplace.
5. Backend menggunakan **NestJS + PostgreSQL + Prisma** sebagai stack yang scalable dan maintainable.
6. Midtrans dan Xendit menjadi payment gateway utama untuk pasar Indonesia.
