import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv

load_dotenv()

SG_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL")
BASE_URL = os.getenv("BASE_URL")


def send_email(to_email, token, subject, content):
    unsubscribe_link = f"{BASE_URL}/unsubscribe?token={token}"

    html = f"""
    <html>
        <body>
            <h2>{content}</h2>

            <p>
                Para cancelar tu suscripción a nuestro boletín, 
                <a href="{unsubscribe_link}">
                    presiona aquí
                </a>
            </p>
        </body>
    </html>
    """

    message = Mail(
        from_email=FROM_EMAIL,
        to_emails=to_email,
        subject=subject,
        html_content=html
    )

    sg = SendGridAPIClient(SG_API_KEY)
    response = sg.send(message)

    print("✅ Código de respuesta:", response.status_code)