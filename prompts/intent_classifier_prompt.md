Klasifikasikan pesan warga ke salah satu intent berikut:

- ask_faq
- request_letter
- submit_complaint
- ask_status
- greeting
- unknown

Kembalikan JSON valid saja.

Format:
{
  "intent": "",
  "confidence": 0.0,
  "reason": ""
}

Contoh:
Pesan: "Saya mau bikin surat pengantar SKCK"
Output:
{
  "intent": "request_letter",
  "confidence": 0.95,
  "reason": "Warga meminta pembuatan surat pengantar"
}