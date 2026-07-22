import smtplib
from email.message import EmailMessage

from app.core.config import Settings
from app.models import Alert, User


class EmailService:

    def __init__(self):
        self.SMTP_HOST = Settings.SMTP_HOST
        self.SMTP_PORT = Settings.SMTP_PORT

    def send_alert(
        self,
        user: User,
        alert: Alert,
        metric_value: float,
    ):

        msg = EmailMessage()

        msg["Subject"] = f" TraceForge Alert!!!! - {alert.metric.value}"
        msg["From"] = Settings.SMTP_EMAIL
        msg["To"] = user.email

        msg.set_content(
            f"""
Hello,

One of your TraceForge alerts has been triggered.

Metric: {alert.metric.value}
Current Value: {metric_value}
Threshold: {alert.threshold_value}
Window: {alert.window_minutes.value} minutes

Regards,
TraceForge
"""
        )

        with smtplib.SMTP(
            self.SMTP_HOST,
            self.SMTP_PORT,
        ) as smtp:

            smtp.starttls()

            smtp.login(
                Settings.SMTP_EMAIL,
                Settings.SMTP_PASSWORD,
            )

            smtp.send_message(msg)