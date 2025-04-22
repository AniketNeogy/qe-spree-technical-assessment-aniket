import { expect, Page } from '@playwright/test';
import { Helpers } from '../utils/helpers';
import { BasePage } from './base-page';

/**
 * Page Object Model for the Spree Commerce Payment Page (checkout step)
 */
export class PaymentPage extends BasePage {
  
  /**
   * Constructor
   * @param page Playwright page object
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to payment page with token
   * @param token The checkout token
   * @returns Promise resolving to this PaymentPage instance 
   */
  async goto(token: string): Promise<this> {
    await super.goto(`/checkout/${token}/payment`);
    return this;
  }

  /**
   * Check if the current step is Payment
   * @returns Promise resolving to boolean
   */
  async isPaymentStep(): Promise<boolean> {
    return await this.page.locator('#checkout-step-payment').isVisible();
  }

  /**
   * Get customer contact information
   * @returns Promise resolving to the customer contact information
   */
  async getContactInfo(): Promise<string> {
    const contactText = await this.page.getByText(/Contact .+@.+ Edit/).textContent();
    return contactText?.trim() || '';
  }

  /**
   * Get shipping address information
   * @returns Promise resolving to the shipping address information
   */
  async getShippingAddress(): Promise<string> {
    const addressText = await this.page.getByText(/Ship Address .+ Edit/).textContent();
    return addressText?.trim() || '';
  }

  /**
   * Get delivery method information
   * @returns Promise resolving to the delivery method information
   */
  async getDeliveryMethod(): Promise<string> {
    const deliveryText = await this.page.getByText(/Delivery method .+ Edit/).textContent();
    return deliveryText?.trim() || '';
  }

  /**
   * Edit contact information
   * @returns Promise resolving to this PaymentPage instance 
   */
  async editContactInfo(): Promise<PaymentPage> {
    await this.page.getByText('Contact').getByRole('link', { name: 'Edit' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Edit shipping address
   * @returns Promise resolving to this PaymentPage instance 
   */
  async editShippingAddress(): Promise<PaymentPage> {
    await this.page.getByText('Ship Address').getByRole('link', { name: 'Edit' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Edit delivery method
   * @returns Promise resolving to this PaymentPage instance 
   */
  async editDeliveryMethod(): Promise<PaymentPage> {
    await this.page.getByText('Delivery method').getByRole('link', { name: 'Edit' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Fill credit card information
   * @param cardInfo Credit card information
   * @returns Promise resolving to this PaymentPage instance 
   */
  async fillCreditCardInfo(cardInfo: {
    nameOnCard: string;
    cardNumber: string;
    expirationDate: string;
    cvv: string;
  }): Promise<PaymentPage> {
    await this.page.getByRole('textbox', { name: 'Name on card' }).fill(cardInfo.nameOnCard);
    await this.page.getByRole('textbox', { name: 'Card Number' }).fill(cardInfo.cardNumber);
    await this.page.getByRole("textbox", { name: "Expiration Date" }).fill(cardInfo.expirationDate);   
    await this.page.getByRole("textbox", { name: "CVV" }).fill(cardInfo.cvv);
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Select check payment method
   * @returns Promise resolving to this PaymentPage instance 
   */
  async selectCheckPayment(): Promise<PaymentPage> {
    await this.page.getByRole('link', { name: 'Check' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Select credit card payment method
   * @returns Promise resolving to this PaymentPage instance 
   */
  async selectCreditCardPayment(): Promise<PaymentPage> {
    // Assuming we need to select a credit card radio button
    await this.page.locator('#order_payments_attributes__payment_method_id_2').check();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Place order and pay
   * @returns Promise resolving to this PaymentPage instance 
   */
  async placeOrder(): Promise<PaymentPage> {
    await this.page.getByRole('button', { name: 'Pay' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Check if order confirmation is displayed
   * @returns Promise resolving to boolean
   */
  async isOrderConfirmed(): Promise<boolean> {
    return await this.page.getByText('Your order is confirmed!').isVisible();
  }

  /**
   * Get order confirmation message
   * @returns Promise resolving to the order confirmation message
   */
  async getOrderConfirmationMessage(): Promise<string> {
    const message = await this.page.locator('h4').textContent();
    return message?.trim() || '';
  }

  /**
   * Get order details from confirmation page
   * @returns Promise resolving to the order details
   */
  async getOrderDetails(): Promise<{
    orderNumber: string;
    productDetails: string;
    subtotal: string;
    shipping: string;
    total: string;
  }> {
    const orderIdMatch = /order_(\d+)/.exec(await this.page.url());
    const orderNumber = orderIdMatch ? orderIdMatch[1] : '';
    
    const productDetails = await this.page.locator('#checkout_line_items').textContent() || '';
    
    const subtotalText = await this.page.getByText(/Subtotal: \$/).textContent() || '';
    const subtotalMatch = subtotalText.match(/\$(\d+\.\d+)/);
    const subtotal = subtotalMatch ? subtotalMatch[0] : '';
    
    const shippingText = await this.page.getByText(/Shipping: \$/).textContent() || '';
    const shippingMatch = shippingText.match(/\$(\d+\.\d+)/);
    const shipping = shippingMatch ? shippingMatch[0] : '';
    
    const totalText = await this.page.getByText(/Total USD \$/).textContent() || '';
    const totalMatch = totalText.match(/\$(\d+\.\d+)/);
    const total = totalMatch ? totalMatch[0] : '';
    
    return {
      orderNumber,
      productDetails: productDetails.trim(),
      subtotal,
      shipping,
      total
    };
  }

  /**
   * Verify order details
   * @param expectedDetails Expected order details
   * @returns Promise resolving to boolean indicating if order details match expectations
   */
  async verifyOrderDetails(expectedDetails: {
    customerName?: string;
    productDetails?: string;
    subtotal?: string;
    shipping?: string;
    total?: string;
  }): Promise<boolean> {
    const confirmationMessage = await this.getOrderConfirmationMessage();
    const orderDetails = await this.getOrderDetails();
    
    let isValid = true;
    
    if (expectedDetails.customerName && 
        !confirmationMessage.includes(`Thanks ${expectedDetails.customerName}`)) {
      isValid = false;
    }
    
    if (expectedDetails.productDetails && 
        !orderDetails.productDetails.includes(expectedDetails.productDetails)) {
      isValid = false;
    }
    
    if (expectedDetails.subtotal && 
        !orderDetails.subtotal.includes(expectedDetails.subtotal)) {
      isValid = false;
    }
    
    if (expectedDetails.shipping && 
        !orderDetails.shipping.includes(expectedDetails.shipping)) {
      isValid = false;
    }
    
    if (expectedDetails.total && 
        !orderDetails.total.includes(expectedDetails.total)) {
      isValid = false;
    }
    
    return isValid;
  }

  /**
   * Complete payment with credit card in one go
   * @param cardInfo Credit card information
   * @returns Promise resolving to order details if successful
   */
  async completePayment(cardInfo: {
    nameOnCard: string;
    cardNumber: string;
    expirationDate: string;
    cvv: string;
  }): Promise<{
    orderNumber: string;
    productDetails: string;
    subtotal: string;
    shipping: string;
    total: string;
  } | null> {
    await this.fillCreditCardInfo(cardInfo);
    await this.selectCreditCardPayment();
    await this.placeOrder();
    
    if (await this.isOrderConfirmed()) {
      return await this.getOrderDetails();
    }
    
    return null;
  }

  /**
   * Verify order success
   * @param firstName The first name of the customer
   * @returns Promise resolving to void
   */
  async verifyOrderSuccess(firstName: string) {
    await expect(this.page.getByText(/R[0-9]+/)).toBeVisible({ timeout: 40000 });  
    await expect(this.page.locator('h4')).toContainText(`Thanks ${firstName} for your order!`);
  }

  async mockPayment() {
    // First intercept the payment update request
    await this.page.route("**/checkout/**/update/payment", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          message: 'Payment processed successfully'
        })
      });
    });
    
    // Then intercept the confirm request
    await this.page.route("**/checkout/**/update/confirm", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          message: 'Payment successful'
        })
      });
    });

    // Finally intercept any redirect to capture request and redirect to complete
    await this.page.route("**/checkout/*/payment", async (route) => {
      const url = new URL(route.request().url());
      const pathSegments = url.pathname.split("/");
      const orderToken = pathSegments[2];
      
      const redirectTo = `http://localhost:3000/checkout/${orderToken}/complete`;
      
      await route.fulfill({
        status: 303,
        headers: {
          "Location": redirectTo,
          "Content-Type": "text/html; charset=utf-8"
        },
        body: ""
      });
    });
  }
}
