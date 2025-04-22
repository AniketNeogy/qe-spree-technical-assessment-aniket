import { expect, Page } from '@playwright/test';
import { Helpers } from '../utils/helpers';
import { BasePage } from './base-page';
import { TestData } from '../fixtures/test-data';
import { PaymentPage } from './payment-page';

/**
 * Page Object Model for the Spree Commerce Delivery Page
 */
export class DeliveryPage extends BasePage {

  /**
   * Constructor
   * @param page Playwright page object
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to delivery page with token
   * @param token The checkout token
   * @returns Promise resolving to this DeliveryPage instance 
   */
  async goto(token: string): Promise<this> {        
    await super.goto(`/checkout/${token}/delivery`);    
    return this;
  }

  /**
   * Check if the current step is Delivery
   * @returns Promise resolving to boolean
   */
  async isDeliveryStep(): Promise<boolean> {
    return await this.page.locator('#checkout-step-delivery').isVisible();
  }

  /**
   * Get customer email from the contact information section
   * @returns Promise resolving to the customer email
   */
  async getCustomerEmail(): Promise<string> {
    const contactSection = this.page.getByText('Contact');
    const emailText = await this.page.getByText(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/).textContent();
    return emailText?.trim() || '';
  }

  /**
   * Get shipping address from the address section
   * @returns Promise resolving to the shipping address
   */
  async getShippingAddress(): Promise<string> {
    const addressText = await this.page.getByText(/[A-Z][a-z]+ [A-Z][a-z]+, \d+ .+/).textContent();
    return addressText?.trim() || '';
  }

  /**
   * Edit contact information
   * @returns Promise resolving to this DeliveryPage instance 
   */
  async editContactInfo(): Promise<DeliveryPage> {
    await this.page.getByRole('link', { name: 'Edit' }).first().click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Edit shipping address
   * @returns Promise resolving to this DeliveryPage instance 
   */
  async editShippingAddress(): Promise<DeliveryPage> {
    await this.page.getByRole('link', { name: 'Edit' }).nth(1).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Select shipping method
   * @param method The shipping method to select (e.g., 'UPS Ground (USD)', 'UPS Two Day (USD)', 'UPS One Day (USD)')
   * @returns Promise resolving to this DeliveryPage instance 
   */
  async selectShippingMethod(method: string): Promise<DeliveryPage> {
    await this.page.getByRole('radio', { name: method }).check();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Get the shipping cost for a specific method
   * @param method The shipping method (e.g., 'UPS Ground (USD)')
   * @returns Promise resolving to the shipping cost as a string
   */
  async getShippingCost(method: string): Promise<string> {
    const methodText = await this.page.getByText(new RegExp(`${method} \\$\\d+\\.\\d+`)).textContent();
    const costMatch = methodText?.match(/\$(\d+\.\d+)/);
    return costMatch ? costMatch[0] : '';
  }

  /**
   * Get current selected shipping method
   * @returns Promise resolving to the currently selected shipping method
   */
  async getSelectedShippingMethod(): Promise<string> {
    const checkedMethod = this.page.locator('input[type="radio"]:checked');
    const methodLabel = checkedMethod.locator('..').locator('label');
    return await methodLabel.textContent() || '';
  }

  /**
   * Apply promo code
   * @param code The promo code to apply
   * @returns Promise resolving to this DeliveryPage instance 
   */
  async applyPromoCode(code: string): Promise<DeliveryPage> {
    await this.page.getByRole('textbox', { name: 'ADD PROMO CODE' }).fill(code);
    await this.page.keyboard.press('Enter');
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Continue to next step (payment)
   * @returns Promise resolving to this DeliveryPage instance 
   */
  async continueToPayment(): Promise<PaymentPage> {
    await this.page.getByRole('button', { name: 'Save and Continue' }).click();
    //wait for the mock payment to complete for credit card payment 
    await this.page.waitForTimeout(10000);  
    await Helpers.waitForPageStable(this.page);
    return new PaymentPage(this.page);
  }

  /**
   * Get order subtotal
   * @returns Promise resolving to the order subtotal as a string
   */
  async getSubtotal(): Promise<string> {
    const subtotalText = await this.page.getByText(/Subtotal: \$/).textContent();
    const amountMatch = subtotalText?.match(/\$(\d+\.\d+)/);
    return amountMatch ? amountMatch[0] : '';
  }

  /**
   * Get shipping cost
   * @returns Promise resolving to the shipping cost as a string
   */
  async getCurrentShippingCost(): Promise<string> {
    const shippingText = await this.page.getByText(/Shipping: \$/).textContent();
    const amountMatch = shippingText?.match(/\$(\d+\.\d+)/);
    return amountMatch ? amountMatch[0] : '';
  }

  /**
   * Get order total
   * @returns Promise resolving to the order total as a string
   */
  async getOrderTotal(): Promise<string> {
    const totalText = await this.page.getByText(/Total USD \$/).textContent();
    const amountMatch = totalText?.match(/\$(\d+\.\d+)/);
    return amountMatch ? amountMatch[0] : '';
  }

  /**
   * Get product details from the order summary
   * @returns Promise resolving to the product details as a string
   */
  async getProductDetails(): Promise<string> {
    const detailsText = await this.page.locator('#checkout_line_items').textContent();
    return detailsText?.trim() || '';
  }

  /**
   * Verify expected costs
   * @param expectedSubtotal Expected subtotal amount
   * @param expectedShipping Expected shipping cost
   * @param expectedTotal Expected total amount
   * @returns Promise resolving to boolean if all costs match expectations
   */
  async verifyOrderCosts(
    expectedSubtotal: string, 
    expectedShipping: string, 
    expectedTotal: string
  ): Promise<boolean> {
    const subtotal = await this.getSubtotal();
    const shipping = await this.getCurrentShippingCost();
    const total = await this.getOrderTotal();
    
    return (
      subtotal.includes(expectedSubtotal) &&
      shipping.includes(expectedShipping) &&
      total.includes(expectedTotal)
    );
  }

  /**
   * Verify delivery shipping details
   * @param email The customer email
   * @param shippingAddress The shipping address
   * @returns Promise resolving to boolean if all details match expectations
   */
  async verifyDeliveryShippingDetails(email: string, shippingAddress: { firstName: string; lastName: string; address1: string }) {
    await expect(this.page.getByText(email.toLowerCase())).toBeVisible(); 
    await expect(this.page.locator('.px-5.word-break').getByText(shippingAddress.firstName)).toBeVisible();
    await expect(this.page.locator('.px-5.word-break').getByText(shippingAddress.lastName)).toBeVisible();
    
    // Make the Edit link verification more robust to handle both flows
    // First check if there are multiple Edit links
    const editLinks = this.page.getByRole('link', { name: 'Edit' });
    const count = await editLinks.count();
    
    if (count > 1) {
      // Guest user flow - use second Edit link
      await expect(editLinks.nth(1)).toBeVisible();
    } else if (count === 1) {
      // Registered user flow - use the only Edit link
      await expect(editLinks.first()).toBeVisible();
    } else {
      // At least one Edit link should be present
      await expect(editLinks).toBeVisible();
    }
  }


  /**
   * Verify shipping cost
   * @param upsGround The shipping method to verify
   * @returns Promise resolving to void
   */
  async verifyShippingCost(itemName: string, upsGround: string) {   
    await expect(this.page.locator('#checkout_summary')).toContainText(upsGround);
    await expect(this.page.locator('#checkout_line_items')).toContainText(itemName);  
  }
}
