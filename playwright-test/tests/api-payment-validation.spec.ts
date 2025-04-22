// tests/api-payment-validation.spec.ts

import { test, expect } from '@playwright/test';
import { APIClient } from '../api/api-client';

test.describe('E2E-04: Payment Processing Validation (API-based)', () => {
  let apiClient: APIClient;

  test.beforeEach(async () => {
    apiClient = new APIClient();
    await apiClient.init(undefined, undefined, true);
  });

  test('Valid payment via credit card', async () => {
    await apiClient.addToCart('product-123', 2);
    await apiClient.setShippingAddress({
      address: '1 Infinite Loop',
      city: 'Cupertino',
      zip: '95014',
      country: 'US',
    });

    await apiClient.setBillingAddress({
      address: '1 Infinite Loop',
      city: 'Cupertino',
      zip: '95014',
      country: 'US',
    });

    const paymentRes = await apiClient.processPayment({
      paymentMethod: 'credit_card',
      cardNumber: '4111111111111111',
      expiry: '12/25',
      cvv: '123',
    });

    expect(paymentRes.ok()).toBeTruthy();
    const body = await paymentRes.json();
    expect(body.status).toBe('success');

    const order = await apiClient.getLatestOrder();
    expect(order.status).toBe('completed');
    expect(order.items.length).toBeGreaterThan(0);
  });

  test('Payment failure - declined card', async () => {
    await apiClient.addToCart('product-456', 1);

    await apiClient.setShippingAddress({
      address: 'Fail Lane',
      city: 'Rejecttown',
      zip: '00000',
      country: 'US',
    });

    await apiClient.setBillingAddress({
      address: 'Fail Lane',
      city: 'Rejecttown',
      zip: '00000',
      country: 'US',
    });

    const paymentRes = await apiClient.processPayment({
      paymentMethod: 'credit_card',
      cardNumber: '4000000000000002',
      expiry: '12/25',
      cvv: '999',
    });

    expect(paymentRes.status()).toBe(400);
    const body = await paymentRes.json();
    expect(body.message).toContain('declined');
  });

  test('Alternative payment method - check', async () => {
    await apiClient.addToCart('product-789', 3);

    await apiClient.setShippingAddress({
      address: '123 Main St',
      city: 'Springfield',
      zip: '12345',
      country: 'US',
    });

    await apiClient.setBillingAddress({
      address: '123 Main St',
      city: 'Springfield',
      zip: '12345',
      country: 'US',
    });

    const paymentRes = await apiClient.processPayment({
      paymentMethod: 'check',
      accountNumber: '9876543210',
      routingNumber: '123456789',
    });

    expect(paymentRes.ok()).toBeTruthy();
    const body = await paymentRes.json();
    expect(body.status).toBe('success');

    const order = await apiClient.getLatestOrder();
    expect(order.status).toBe('completed');
  });
}); 