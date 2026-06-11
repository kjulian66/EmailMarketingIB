import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv

load_dotenv()

SG_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL")
BASE_URL = os.getenv("BASE_URL")



def send_email(to_email, token, subject, content):
    try:
        sg = SendGridAPIClient(SG_API_KEY)

        unsubscribe_link = f"{BASE_URL}/unsubscribe?token={token}"

        html = f"""
        <html>
            <body>
                <h2>{content}</h2>

                <p>
                    Para cancelar tu suscripción,
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
            html_content=html,
        )

        response = sg.send(message)

        print("===================================")
        print("TO:", to_email)
        print("FROM:", FROM_EMAIL)
        print("STATUS:", response.status_code)
        print("BODY:", response.body)
        print("===================================")

        if response.status_code == 202:
            print(f"✅ Email enviado a {to_email}")
            return True
        else:
            print(f"❌ SendGrid rechazó ({response.status_code})")
            return False

    except Exception as e:
        print("===================================")
        print(f"❌ Error enviando email a {to_email}")
        
        # 🔥 esto es lo importante para ver el ERROR REAL
        if hasattr(e, "body"):
            print("BODY:", e.body)

        if hasattr(e, "headers"):
            print("HEADERS:", e.headers)

        print("ERROR:", str(e))
        print("===================================")

        return False
