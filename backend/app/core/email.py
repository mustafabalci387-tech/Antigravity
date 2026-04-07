import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import asyncio

class EmailService:
    @staticmethod
    def send_email_sync(to_email: str, subject: str, html_content: str):
        # SMTP ayarları (.env'den gelecek, fallback ekliyorum)
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", 587))
        smtp_username = os.getenv("SMTP_USERNAME", "test@example.com")
        smtp_password = os.getenv("SMTP_PASSWORD", "password")

        # Şimdilik gerçek e-posta göndermeyip loglayabiliriz veya dummy tutabiliriz.
        # Hoca 'SMTP ayarlarını oku' dediği için gerçek kütüphaneyi kullanıyoruz.
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = smtp_username
        msg["To"] = to_email

        part = MIMEText(html_content, "html")
        msg.attach(part)

        try:
            # Sadece test ortamında SSL denememek için dummy veya log:
            if smtp_username == "test@example.com":
                print(f"[EmailService - Log Only] TO: {to_email} | SUBJECT: {subject}")
                return True
                
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.sendmail(smtp_username, to_email, msg.as_string())
            server.quit()
            return True
        except Exception as e:
            print(f"[EmailService] E-posta gönderme hatası: {str(e)}")
            return False

    @staticmethod
    async def send_email(to_email: str, subject: str, html_content: str):
        """Asenkron olarak e-posta gönderir (BackgroundTasks ile de kullanılabilir, ancak doğrudan await de edilebilir)."""
        return await asyncio.to_thread(EmailService.send_email_sync, to_email, subject, html_content)
