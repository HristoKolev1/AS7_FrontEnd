// src/pages/PaymentPage.tsx
import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import axios from 'axios';
import { useCart, CartItem, Cart } from '../context/CartContext';
import { jwtDecode } from 'jwt-decode';
import { JWTPayload } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';
import './PaymentPage.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

interface CreateIntentResponse {
  clientSecret:    string;
  paymentIntentId: string;
}
interface ConfirmResponse {
  status: string; // e.g. "succeeded"
}

const CheckoutForm: React.FC = () => {
  const stripe   = useStripe();
  const elements = useElements();
  const location = useLocation();
  const passed   = (location.state as any)?.cart;
  const { cart: contextCart } = useCart();
  const cart     = passed ?? contextCart;

  const navigate = useNavigate();

  const [error,           setError]           = useState<string | null>(null);
  const [processing,      setProcessing]      = useState(false);
  const [succeeded,       setSucceeded]       = useState(false);
  const [clientSecret,    setClientSecret]    = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');

  // 1️⃣ Create PaymentIntent once we have a non-empty cart
  useEffect(() => {
    const initPayment = async () => {
      if (!cart || cart.cartItems.length === 0) return;

      try {
        const token = localStorage.getItem('jwtToken')!;
        const { id: userId } = jwtDecode<JWTPayload & { id: number }>(token);

        // Calculate total in cents
        const amount = cart.cartItems.reduce(
          (sum: number, item: CartItem) => sum + item.price,
          0
        );
        const finalPrice = Math.round(amount * 100);

        const productIds = cart.cartItems.map((item: CartItem) => item.productId);

        // Vite proxy will forward this to your ELB
        const res = await axios.post<CreateIntentResponse>(
          '/api/payment/create-payment-intent',
          { amount: finalPrice, currency: 'usd', userId, productIds }
        );

        setClientSecret(res.data.clientSecret);
        setPaymentIntentId(res.data.paymentIntentId);
      } catch (err) {
        console.error('Error creating PaymentIntent:', err);
        setError('Failed to initialize payment.');
      }
    };

    initPayment();
  }, [cart]);

  // 2️⃣ On submit: create a PaymentMethod, then confirm via backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const card = elements.getElement(CardElement);
    if (!card) {
      setError('Card details not found.');
      setProcessing(false);
      return;
    }

    const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card
    });
    if (pmError) {
      setError(pmError.message || 'Failed to create payment method.');
      setProcessing(false);
      return;
    }

    try {
      // Vite proxy will forward this as well
      const res = await axios.post<ConfirmResponse>(
        '/api/payment/confirm-payment-intent',
        { paymentIntentId, paymentMethodId: paymentMethod.id }
      );

      if (res.data.status === 'succeeded') {
        setSucceeded(true);
      } else {
        setError(`Payment ${res.data.status}`);
      }
    } catch (err) {
      console.error('Payment confirmation error:', err);
      setError('Payment confirmation failed.');
    }

    setProcessing(false);
  };

  if (succeeded) {
    return (
      <div className="result">
        Payment successful! 🎉
        <button onClick={() => navigate('/profile')}>Back to Profile</button>
      </div>
    );
  }

  return (
    <form className="payment-form" onSubmit={handleSubmit}>
      <CardElement className="card-element" />
      {error && <div className="error">{error}</div>}
      <button
        type="submit"
        disabled={!stripe || !clientSecret || processing}
        className="pay-btn"
      >
        {processing ? 'Processing…' : 'Pay Now'}
      </button>
    </form>
  );
};

const PaymentPage: React.FC = () => {
  const options: StripeElementsOptions = { appearance: { theme: 'stripe' } };

  return (
    <div className="payment-page">
      <h1>Complete Your Payment</h1>
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm />
      </Elements>
    </div>
  );
};

export default PaymentPage;
