import smtplib
from email.message import EmailMessage

from app.core.config import settings


def send_email(
    to: str,
    subject: str,
    body: str,
):
    msg = EmailMessage()

    msg["Subject"] = subject
    msg["From"] = settings.SMTP_EMAIL
    msg["To"] = to

    msg.set_content(body)

    with smtplib.SMTP(
        settings.SMTP_HOST,
        settings.SMTP_PORT,
    ) as smtp:

        smtp.starttls()

        smtp.login(
            settings.SMTP_EMAIL,
            settings.SMTP_PASSWORD,
        )

        smtp.send_message(msg)