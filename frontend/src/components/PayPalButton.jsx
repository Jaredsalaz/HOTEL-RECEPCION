/**
 * PayPal Payment Button Component
 * Handles PayPal payment integration
 */
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * PayPalButton Component
 * @param {number} amount - Amount to charge in MXN
 * @param {string} currency - Currency code (default: MXN)
 * @param {Function} onSuccess - Callback after successful payment
 * @param {Function} onError - Callback on payment error
 * @param {Object} reservationData - Data about the reservation
 */
const PayPalButton = ({
  amount,
  currency = 'MXN',
  onSuccess,
  onError,
  reservationData
}) => {
  const [isPaying, setIsPaying] = useState(false);

  // PayPal client ID from environment variable
  const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test';

  /**
   * Create PayPal order
   */
  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          description: `Reserva Habitación #${reservationData.room_number} - ${reservationData.nights} noches`,
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: currency,
                value: amount.toFixed(2)
              }
            }
          },
          items: [
            {
              name: `Habitación ${reservationData.room_type}`,
              description: `Check-in: ${reservationData.check_in} | Check-out: ${reservationData.check_out}`,
              unit_amount: {
                currency_code: currency,
                value: reservationData.price_per_night.toFixed(2)
              },
              quantity: reservationData.nights.toString()
            }
          ]
        }
      ],
      application_context: {
        shipping_preference: 'NO_SHIPPING'
      }
    });
  };

  /**
   * Handle payment approval
   */
  const onApprove = async (data, actions) => {
    setIsPaying(true);
    try {
      const details = await actions.order.capture();
      
      console.log('Payment completed:', details);
      
      // Payment successful
      const paymentData = {
        orderId: data.orderID,
        payerId: data.payerID,
        paymentId: details.id,
        status: details.status,
        payer: {
          email: details.payer.email_address,
          name: `${details.payer.name.given_name} ${details.payer.name.surname}`
        },
        amount: details.purchase_units[0].amount.value,
        currency: details.purchase_units[0].amount.currency_code,
        create_time: details.create_time,
        update_time: details.update_time
      };
      
      toast.success('¡Pago procesado exitosamente!');
      
      if (onSuccess) {
        onSuccess(paymentData);
      }
      
    } catch (error) {
      console.error('Error capturing payment:', error);
      toast.error('Error al procesar el pago');
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsPaying(false);
    }
  };

  /**
   * Handle payment cancellation
   */
  const onCancel = () => {
    toast.error('Pago cancelado');
    setIsPaying(false);
  };

  /**
   * Handle payment error
   */
  const onErrorHandler = (err) => {
    console.error('PayPal error:', err);
    toast.error('Error al procesar el pago con PayPal');
    setIsPaying(false);
    
    if (onError) {
      onError(err);
    }
  };

  return (
    <div className="paypal-button-container">
      {isPaying && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Procesando pago...</p>
        </div>
      )}
      
      <PayPalScriptProvider
        options={{
          'client-id': PAYPAL_CLIENT_ID,
          currency: currency,
          intent: 'capture'
        }}
      >
        <PayPalButtons
          style={{
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal'
          }}
          createOrder={createOrder}
          onApprove={onApprove}
          onCancel={onCancel}
          onError={onErrorHandler}
          disabled={isPaying}
        />
      </PayPalScriptProvider>
      
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>💳 Pago seguro procesado por PayPal</p>
        <p className="mt-1">Acepta tarjetas de crédito y débito</p>
      </div>
    </div>
  );
};

export default PayPalButton;
