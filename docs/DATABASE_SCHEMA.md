# Database Schema

## Main Tables

- rts
- users
- rt_members
- faqs
- letter_templates
- letter_requests
- complaint_reports
- chat_sessions
- chat_messages
- ai_audit_logs

## Enums

### user_role
- super_admin
- rt_admin
- warga

### letter_status
- collecting_data
- waiting_admin_review
- approved
- rejected
- completed

### complaint_status
- new
- in_review
- in_progress
- resolved
- rejected

### complaint_category
- fasilitas_umum
- keamanan
- kebersihan
- administrasi
- sosial
- lainnya

### ai_intent
- ask_faq
- request_letter
- submit_complaint
- ask_status
- greeting
- unknown