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
        Send reservation cancellation email with professional message
        
        Args:
            recipient_email: Email address of the recipient
            reservation_data: Dictionary with reservation details
            
        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            cancellation_time = datetime.now()
            refund_info = ""
            if reservation_data.get('payment_status') == 'Paid':
                refund_info = """
                <div class="refund-box">
                    <p style="margin: 0; color: #065f46;">
                        <strong>💳 Información de Reembolso:</strong><br>
                        Tu pago será reembolsado según nuestras políticas de cancelación. 
                        Recibirás el reembolso en 5-10 días hábiles.
                    </p>
                </div>
                """
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {{
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 0;
                        background-color: #f5f5f5;
                    }}
                    .email-container {{
                        background: white;
                        margin: 20px;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }}
                    .header {{
                        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                        color: white;
                        padding: 40px 30px;
                        text-align: center;
                    }}
                    .header h1 {{
                        margin: 0;
                        font-size: 28px;
                        font-weight: 600;
                    }}
                    .icon {{
                        font-size: 48px;
                        margin-bottom: 10px;
                    }}
                    .content {{
                        padding: 40px 30px;
                        background: #ffffff;
                    }}
                    .greeting {{
                        font-size: 18px;
                        color: #dc2626;
                        font-weight: 600;
                        margin-bottom: 20px;
                    }}
                    .message {{
                        font-size: 16px;
                        color: #555;
                        margin-bottom: 15px;
                    }}
                    .info-box {{
                        background: #fef2f2;
                        border-left: 4px solid #dc2626;
                        padding: 20px;
                        margin: 25px 0;
                        border-radius: 6px;
                    }}
                    .info-row {{
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        border-bottom: 1px solid #fee2e2;
                    }}
                    .info-row:last-child {{
                        border-bottom: none;
                    }}
                    .info-label {{
                        font-weight: 600;
                        color: #991b1b;
                    }}
                    .info-value {{
                        color: #333;
                    }}
                    .refund-box {{
                        background: #d1fae5;
                        border: 2px solid #10b981;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                    }}
                    .apology-box {{
                        background: #fffbeb;
                        border-radius: 8px;
                        padding: 25px;
                        margin-top: 25px;
                        text-align: center;
                    }}
                    .apology-text {{
                        font-size: 16px;
                        color: #92400e;
                        margin: 10px 0;
                    }}
                    .come-back {{
                        background: #dbeafe;
                        border: 2px solid #3b82f6;
                        border-radius: 8px;
                        padding: 20px;
                        margin-top: 20px;
                        text-align: center;
                    }}
                    .come-back-text {{
                        font-size: 18px;
                        color: #1e40af;
                        font-weight: 600;
                        margin: 5px 0;
                    }}
                    .footer {{
                        background: #f9fafb;
                        padding: 25px 30px;
                        text-align: center;
                        border-top: 1px solid #e5e7eb;
                    }}
                    .footer-text {{
                        font-size: 14px;
                        color: #6b7280;
                        margin: 5px 0;
                    }}
                    .contact-info {{
                        margin-top: 15px;
                        font-size: 13px;
                        color: #9ca3af;
                    }}
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <div class="icon">❌</div>
                        <h1>Cancelación de Reserva</h1>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">
                            Estimado/a {reservation_data['guest_name']},
                        </div>
                        
                        <p class="message">
                            Te confirmamos que tu reserva ha sido <strong>cancelada exitosamente</strong>.
                        </p>
                        
                        <div class="info-box">
                            <h3 style="margin-top: 0; color: #991b1b;">📋 Detalles de la Cancelación</h3>
                            <div class="info-row">
                                <span class="info-label">Reserva:</span>
                                <span class="info-value">#{reservation_data['reservation_id']}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Habitación:</span>
                                <span class="info-value">{reservation_data.get('room_number', 'N/A')}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Fecha de Check-in Original:</span>
                                <span class="info-value">{reservation_data.get('check_in_date', 'N/A')}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Fecha de Cancelación:</span>
                                <span class="info-value">{cancellation_time.strftime('%d/%m/%Y a las %H:%M')}</span>
                            </div>
                        </div>
                        
                        {refund_info}
                        
                        <div class="apology-box">
                            <p class="apology-text">
                                <strong>Lamentamos que no puedas quedarte con nosotros en esta ocasión.</strong>
                            </p>
                            <p class="apology-text">
                                Entendemos que los planes pueden cambiar y respetamos tu decisión. 
                                Esperamos poder recibirte en el futuro.
                            </p>
                        </div>
                        
                        <div class="come-back">
                            <p class="come-back-text">
                                🏨 ¡Te esperamos en otra ocasión!
                            </p>
                            <p style="margin: 10px 0 0 0; color: #1e40af; font-size: 15px;">
                                Siempre serás bienvenido/a en Hotel Recepción. <br>
                                Estaremos encantados de atenderte cuando lo desees.
                            </p>
                        </div>
                        
                        <p class="message" style="margin-top: 25px; text-align: center; color: #666;">
                            Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos.
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p class="footer-text"><strong>Hotel Recepción</strong></p>
                        <p class="footer-text">Siempre a tu servicio</p>
                        <div class="contact-info">
                            <p>📧 andres.cruz01@unach.mx | 📞 +52 123 456 7890</p>
                            <p>📍 Dirección del Hotel, Ciudad, Estado</p>
                            <p style="margin-top: 10px;">Para nuevas reservas, visítanos cuando quieras</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """
            
            message = MessageSchema(
                subject=f"✅ Cancelación Confirmada - Reserva #{reservation_data['reservation_id']} - Hotel Recepción",
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
    
    @staticmethod
    async def send_checkin_email(
        recipient_email: str,
        reservation_data: Dict[str, Any]
    ) -> bool:
        """
        Send check-in confirmation email with welcome message
        
        Args:
            recipient_email: Email address of the recipient
            reservation_data: Dictionary with reservation details
            
        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            checkin_time = reservation_data.get('actual_check_in', datetime.now())
            if isinstance(checkin_time, str):
                checkin_time = datetime.fromisoformat(checkin_time.replace('Z', '+00:00'))
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {{
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 0;
                        background-color: #f5f5f5;
                    }}
                    .email-container {{
                        background: white;
                        margin: 20px;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }}
                    .header {{
                        background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
                        color: white;
                        padding: 40px 30px;
                        text-align: center;
                    }}
                    .header h1 {{
                        margin: 0;
                        font-size: 28px;
                        font-weight: 600;
                    }}
                    .welcome-icon {{
                        font-size: 48px;
                        margin-bottom: 10px;
                    }}
                    .content {{
                        padding: 40px 30px;
                        background: #ffffff;
                    }}
                    .greeting {{
                        font-size: 18px;
                        color: #0284c7;
                        font-weight: 600;
                        margin-bottom: 20px;
                    }}
                    .message {{
                        font-size: 16px;
                        color: #555;
                        margin-bottom: 15px;
                    }}
                    .info-box {{
                        background: #f0f9ff;
                        border-left: 4px solid #0284c7;
                        padding: 20px;
                        margin: 25px 0;
                        border-radius: 6px;
                    }}
                    .info-row {{
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        border-bottom: 1px solid #e0f2fe;
                    }}
                    .info-row:last-child {{
                        border-bottom: none;
                    }}
                    .info-label {{
                        font-weight: 600;
                        color: #0369a1;
                    }}
                    .info-value {{
                        color: #333;
                    }}
                    .highlight {{
                        background: #fef3c7;
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-weight: 600;
                    }}
                    .thank-you {{
                        background: #f0fdf4;
                        border: 2px solid #86efac;
                        border-radius: 8px;
                        padding: 20px;
                        margin-top: 25px;
                        text-align: center;
                    }}
                    .thank-you-text {{
                        font-size: 18px;
                        color: #166534;
                        font-weight: 600;
                        margin-bottom: 10px;
                    }}
                    .footer {{
                        background: #f9fafb;
                        padding: 25px 30px;
                        text-align: center;
                        border-top: 1px solid #e5e7eb;
                    }}
                    .footer-text {{
                        font-size: 14px;
                        color: #6b7280;
                        margin: 5px 0;
                    }}
                    .contact-info {{
                        margin-top: 15px;
                        font-size: 13px;
                        color: #9ca3af;
                    }}
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <div class="welcome-icon">🏨</div>
                        <h1>¡Bienvenido a Hotel Recepción!</h1>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">
                            ¡Hola, {reservation_data['guest_name']}! 👋
                        </div>
                        
                        <p class="message">
                            Nos complace confirmar que has realizado tu <strong>check-in exitosamente</strong>. 
                            Esperamos que disfrutes de una estancia maravillosa con nosotros.
                        </p>
                        
                        <div class="info-box">
                            <h3 style="margin-top: 0; color: #0369a1;">📋 Detalles de tu Estancia</h3>
                            <div class="info-row">
                                <span class="info-label">Reserva:</span>
                                <span class="info-value">#{reservation_data['reservation_id']}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Habitación:</span>
                                <span class="info-value highlight">{reservation_data.get('room_number', 'N/A')}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Tipo:</span>
                                <span class="info-value">{reservation_data.get('room_type', 'N/A')}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Check-in:</span>
                                <span class="info-value">{checkin_time.strftime('%d/%m/%Y a las %H:%M')}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Check-out:</span>
                                <span class="info-value">{reservation_data.get('check_out_date', 'N/A')}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Huéspedes:</span>
                                <span class="info-value">{reservation_data.get('guests_count', 1)} persona(s)</span>
                            </div>
                        </div>
                        
                        <p class="message">
                            <strong>🔑 Ya puedes disfrutar de tu habitación.</strong> Si necesitas algo durante tu estancia, 
                            no dudes en contactar a nuestra recepción. Estamos aquí para hacer tu visita inolvidable.
                        </p>
                        
                        <div class="thank-you">
                            <div class="thank-you-text">
                                ✨ ¡Gracias por elegirnos! ✨
                            </div>
                            <p style="margin: 0; color: #166534;">
                                Tu confianza es muy importante para nosotros
                            </p>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p class="footer-text"><strong>Hotel Recepción</strong></p>
                        <p class="footer-text">Tu comodidad es nuestra prioridad</p>
                        <div class="contact-info">
                            <p>📧 andres.cruz01@unach.mx | 📞 +52 123 456 7890</p>
                            <p>📍 Dirección del Hotel, Ciudad, Estado</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """
            
            message = MessageSchema(
                subject=f"🏨 ¡Bienvenido! Check-in Confirmado - Reserva #{reservation_data['reservation_id']}",
                recipients=[recipient_email],
                body=html_content,
                subtype="html"
            )
            
            fm = FastMail(conf)
            await fm.send_message(message)
            
            return True
            
        except Exception as e:
            print(f"Error sending check-in email: {str(e)}")
            return False
    
    @staticmethod
    async def send_checkout_email(
        recipient_email: str,
        reservation_data: Dict[str, Any]
    ) -> bool:
        """
        Send check-out confirmation email with thank you message
        
        Args:
            recipient_email: Email address of the recipient
            reservation_data: Dictionary with reservation details
            
        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            checkout_time = reservation_data.get('actual_check_out', datetime.now())
            if isinstance(checkout_time, str):
                checkout_time = datetime.fromisoformat(checkout_time.replace('Z', '+00:00'))
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {{
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 0;
                        background-color: #f5f5f5;
                    }}
                    .email-container {{
                        background: white;
                        margin: 20px;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }}
                    .header {{
                        background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
                        color: white;
                        padding: 40px 30px;
                        text-align: center;
                    }}
                    .header h1 {{
                        margin: 0;
                        font-size: 28px;
                        font-weight: 600;
                    }}
                    .goodbye-icon {{
                        font-size: 48px;
                        margin-bottom: 10px;
                    }}
                    .content {{
                        padding: 40px 30px;
                        background: #ffffff;
                    }}
                    .greeting {{
                        font-size: 18px;
                        color: #0891b2;
                        font-weight: 600;
                        margin-bottom: 20px;
                    }}
                    .message {{
                        font-size: 16px;
                        color: #555;
                        margin-bottom: 15px;
                    }}
                    .info-box {{
                        background: #f0fdfa;
                        border-left: 4px solid #14b8a6;
                        padding: 20px;
                        margin: 25px 0;
                        border-radius: 6px;
                    }}
                    .info-row {{
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        border-bottom: 1px solid #ccfbf1;
                    }}
                    .info-row:last-child {{
                        border-bottom: none;
                    }}
                    .info-label {{
                        font-weight: 600;
                        color: #0f766e;
                    }}
                    .info-value {{
                        color: #333;
                    }}
                    .thank-you {{
                        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                        border-radius: 8px;
                        padding: 30px;
                        margin-top: 25px;
                        text-align: center;
                    }}
                    .thank-you-title {{
                        font-size: 24px;
                        color: #92400e;
                        font-weight: 700;
                        margin-bottom: 15px;
                    }}
                    .thank-you-text {{
                        font-size: 16px;
                        color: #78350f;
                        margin: 10px 0;
                    }}
                    .see-you-soon {{
                        background: #dbeafe;
                        border: 2px dashed #3b82f6;
                        border-radius: 8px;
                        padding: 20px;
                        margin-top: 25px;
                        text-align: center;
                    }}
                    .see-you-text {{
                        font-size: 20px;
                        color: #1e40af;
                        font-weight: 600;
                        margin: 0;
                    }}
                    .footer {{
                        background: #f9fafb;
                        padding: 25px 30px;
                        text-align: center;
                        border-top: 1px solid #e5e7eb;
                    }}
                    .footer-text {{
                        font-size: 14px;
                        color: #6b7280;
                        margin: 5px 0;
                    }}
                    .contact-info {{
                        margin-top: 15px;
                        font-size: 13px;
                        color: #9ca3af;
                    }}
                    .feedback-box {{
                        background: #fef2f2;
                        border: 2px solid #fca5a5;
                        border-radius: 8px;
                        padding: 20px;
                        margin-top: 20px;
                        text-align: center;
                    }}
                    .feedback-text {{
                        color: #991b1b;
                        font-size: 15px;
                        margin: 5px 0;
                    }}
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <div class="goodbye-icon">👋</div>
                        <h1>¡Hasta Pronto!</h1>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">
                            Querido/a {reservation_data['guest_name']}, 💙
                        </div>
                        
                        <p class="message">
                            Has completado tu <strong>check-out exitosamente</strong>. Ha sido un placer tenerte 
                            como huésped en Hotel Recepción.
                        </p>
                        
                        <div class="info-box">
                            <h3 style="margin-top: 0; color: #0f766e;">📋 Resumen de tu Estancia</h3>
                            <div class="info-row">
                                <span class="info-label">Reserva:</span>
                                <span class="info-value">#{reservation_data['reservation_id']}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Habitación:</span>
                                <span class="info-value">{reservation_data.get('room_number', 'N/A')}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Check-out:</span>
                                <span class="info-value">{checkout_time.strftime('%d/%m/%Y a las %H:%M')}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Duración:</span>
                                <span class="info-value">{reservation_data.get('nights', 'N/A')} noche(s)</span>
                            </div>
                        </div>
                        
                        <div class="thank-you">
                            <div class="thank-you-title">
                                ⭐ ¡Muchísimas Gracias! ⭐
                            </div>
                            <p class="thank-you-text">
                                <strong>Gracias por elegirnos y confiar en nosotros.</strong>
                            </p>
                            <p class="thank-you-text">
                                Tu visita significa mucho para nuestro equipo. Esperamos haber superado 
                                tus expectativas y que te lleves gratos recuerdos de tu estancia.
                            </p>
                        </div>
                        
                        <div class="see-you-soon">
                            <p class="see-you-text">
                                🌟 ¡Esperamos verte pronto de nuevo! 🌟
                            </p>
                            <p style="margin: 10px 0 0 0; color: #1e40af;">
                                Las puertas de Hotel Recepción siempre están abiertas para ti
                            </p>
                        </div>
                        
                        <div class="feedback-box">
                            <p class="feedback-text">
                                <strong>💬 Tu opinión es valiosa</strong>
                            </p>
                            <p class="feedback-text">
                                ¿Te gustaría compartir tu experiencia? Nos encantaría conocer tus comentarios.
                            </p>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p class="footer-text"><strong>Hotel Recepción</strong></p>
                        <p class="footer-text">Gracias por ser parte de nuestra familia</p>
                        <div class="contact-info">
                            <p>📧 andres.cruz01@unach.mx | 📞 +52 123 456 7890</p>
                            <p>📍 Dirección del Hotel, Ciudad, Estado</p>
                            <p style="margin-top: 10px;">Para futuras reservas, visítanos en nuestro sitio web</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """
            
            message = MessageSchema(
                subject=f"👋 ¡Gracias por tu Visita! Check-out Confirmado - Reserva #{reservation_data['reservation_id']}",
                recipients=[recipient_email],
                body=html_content,
                subtype="html"
            )
            
            fm = FastMail(conf)
            await fm.send_message(message)
            
            return True
            
        except Exception as e:
            print(f"Error sending check-out email: {str(e)}")
            return False
