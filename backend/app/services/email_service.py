"""
Email Service
Handles sending confirmation emails to guests
"""
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from typing import Dict, Any
from datetime import datetime
from app.config import settings

# Email configuration with direct credentials
conf = ConnectionConfig(
    MAIL_USERNAME="andres.cruz01@unach.mx",
    MAIL_PASSWORD="xaav vsqc swuf gucs",
    MAIL_FROM="Hotel Recepción <andres.cruz01@unach.mx>",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

class EmailService:
    """Service for sending emails"""
    
    @staticmethod
    def get_confirmation_email_html(reservation_data: Dict[str, Any]) -> str:
        """
        Generate HTML template for reservation confirmation email
        
        Args:
            reservation_data: Dictionary with reservation details
            
        Returns:
            HTML string for email body
        """
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 28px;
                }}
                .content {{
                    background: #f9fafb;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .confirmation-box {{
                    background: white;
                    border-left: 4px solid #667eea;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 5px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }}
                .detail-row {{
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                    border-bottom: 1px solid #e5e7eb;
                }}
                .detail-label {{
                    font-weight: bold;
                    color: #666;
                }}
                .detail-value {{
                    color: #333;
                }}
                .total {{
                    font-size: 24px;
                    font-weight: bold;
                    color: #667eea;
                    text-align: right;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 2px solid #667eea;
                }}
                .footer {{
                    text-align: center;
                    padding: 20px;
                    color: #666;
                    font-size: 14px;
                }}
                .button {{
                    display: inline-block;
                    background: #667eea;
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏨 Confirmación de Reserva</h1>
                <p>Hotel Reception System</p>
            </div>
            
            <div class="content">
                <p>Estimado/a {reservation_data['guest_name']},</p>
                
                <p>¡Gracias por tu reserva! Nos complace confirmar tu estancia en nuestro hotel.</p>
                
                <div class="confirmation-box">
                    <h2 style="color: #667eea; margin-top: 0;">Detalles de tu Reserva</h2>
                    
                    <div class="detail-row">
                        <span class="detail-label">Número de Confirmación:</span>
                        <span class="detail-value">#{reservation_data['reservation_id']}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Habitación:</span>
                        <span class="detail-value">#{reservation_data['room_number']} - {reservation_data['room_type']}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Fecha de Entrada:</span>
                        <span class="detail-value">{reservation_data['check_in']}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Fecha de Salida:</span>
                        <span class="detail-value">{reservation_data['check_out']}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Número de Huéspedes:</span>
                        <span class="detail-value">{reservation_data['guests_count']}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Noches:</span>
                        <span class="detail-value">{reservation_data['total_nights']}</span>
                    </div>
                    
                    <div class="total">
                        Total: ${reservation_data['total_price']:,.2f} MXN
                    </div>
                </div>
                
                <p><strong>Estado del Pago:</strong> ✅ Confirmado</p>
                
                <p>Por favor, presenta este correo al momento del check-in junto con una identificación oficial.</p>
                
                <div style="text-align: center;">
                    <a href="#" class="button">Ver Mi Reserva</a>
                </div>
                
                <p style="margin-top: 30px; padding: 15px; background: #fef3c7; border-radius: 5px; font-size: 14px;">
                    ⏰ <strong>Recordatorio:</strong> Check-in a partir de las 15:00 hrs. Check-out antes de las 12:00 hrs.
                </p>
            </div>
            
            <div class="footer">
                <p>¿Necesitas ayuda? Contáctanos en support@hotelrecepcion.com</p>
                <p>© 2025 Hotel Reception System. Todos los derechos reservados.</p>
            </div>
        </body>
        </html>
        """
    
    @staticmethod
    async def send_confirmation_email(
        recipient_email: str,
        reservation_data: Dict[str, Any]
    ) -> bool:
        """
        Send reservation confirmation email
        
        Args:
            recipient_email: Email address of the recipient
            reservation_data: Dictionary with reservation details
            
        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            html_content = EmailService.get_confirmation_email_html(reservation_data)
            
            message = MessageSchema(
                subject=f"Confirmación de Reserva #{reservation_data['reservation_id']} - Hotel Reception",
                recipients=[recipient_email],
                body=html_content,
                subtype="html"
            )
            
            fm = FastMail(conf)
            await fm.send_message(message)
            
            return True
            
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return False
    
    @staticmethod
    async def send_cancellation_email(
        recipient_email: str,
        reservation_data: Dict[str, Any]
    ) -> bool:
        """
        Send reservation cancellation email
        
        Args:
            recipient_email: Email address of the recipient
            reservation_data: Dictionary with reservation details
            
        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Cancelación de Reserva</h1>
                </div>
                <div class="content">
                    <p>Estimado/a {reservation_data['guest_name']},</p>
                    <p>Tu reserva #{reservation_data['reservation_id']} ha sido cancelada exitosamente.</p>
                    <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                </div>
            </body>
            </html>
            """
            
            message = MessageSchema(
                subject=f"Cancelación de Reserva #{reservation_data['reservation_id']}",
                recipients=[recipient_email],
                body=html_content,
                subtype="html"
            )
            
            fm = FastMail(conf)
            await fm.send_message(message)
            
            return True
            
        except Exception as e:
            print(f"Error sending cancellation email: {str(e)}")
            return False
