import { expect, Page } from '@playwright/test';
import { Helpers } from '../utils/helpers';
import { BasePage } from './base-page';

/**
 * Page Object Model for the Spree Commerce Checkout Page
 */
export class CheckoutPage extends BasePage {
  
  /**
   * Constructor
   * @param page Playwright page object
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to checkout
   * @returns Promise resolving to this CheckoutPage instance 
   */
  async goto(): Promise<this> {
    await super.goto('/checkout');
    return this;
  }

  /**
   * Check if the current step is Address
   * @returns Promise resolving to boolean
   */
  async isAddressStep(): Promise<boolean> {
    return await this.page.getByLabel('breadcrumb').getByText('Address').isVisible();
  }

  /**
   * Check if login option is visible on the checkout page
   * @returns Promise resolving to boolean
   */
  async isLoginOptionVisible(): Promise<boolean> {
    return await this.page.getByRole('link', { name: 'Login' }).isVisible();
  }

  /**
   * Login with existing account during checkout
   * @param email Email address
   * @param password Password
   * @returns Promise resolving to this CheckoutPage instance
   */
  async loginWithExistingAccount(email: string, password: string): Promise<CheckoutPage> {
    await this.page.getByRole('link', { name: 'Login' }).click();
    await this.page.getByRole('textbox', { name: 'Email' }).fill(email);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Continue as guest
   * @param email Guest email address
   * @param subscribeToNewsletter Whether to subscribe to newsletter
   * @param createAccount Whether to create an account
   * @returns Promise resolving to this CheckoutPage instance 
   */
  async continueAsGuest(
    email: string, 
    subscribeToNewsletter: boolean = false, 
    createAccount: boolean = false
  ): Promise<CheckoutPage> {
    await this.page.getByRole('textbox', { name: 'Email' }).fill(email);
    
    if (subscribeToNewsletter) {
      await this.page.getByRole('checkbox', { name: 'Email me about new products,' }).check();
    }
    
    if (createAccount) {
      await this.page.getByRole('checkbox', { name: 'Create an account for faster' }).check();
    }
    
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Fill billing address
   * @param address Address information
   * @returns Promise resolving to this CheckoutPage instance 
   */
  async fillBillingAddress(address: {
    firstName: string,
    lastName: string,
    address1: string,
    address2?: string,
    city: string,
    zipcode: string,
    phone: string,
    state: string,
    country: string
  }): Promise<CheckoutPage> {
    // Select country first (may affect available states)
    await this.page.getByLabel('Country').selectOption({ label: address.country });
    await Helpers.waitForPageStable(this.page);
    
    await this.page.getByRole('textbox', { name: 'First Name' }).fill(address.firstName);
    await this.page.getByRole('textbox', { name: 'Last Name' }).fill(address.lastName);
    await this.page.getByRole('textbox', { name: 'Address', exact: true }).fill(address.address1);
    
    if (address.address2) {
      await this.page.getByRole('textbox', { name: 'Address (contd.)' }).fill(address.address2);
    }
    
    await this.page.getByRole('textbox', { name: 'City' }).fill(address.city);
    
    // Select state
    await this.page.locator('#order_ship_address_attributes_state_id').selectOption({ label: address.state });
    
    await this.page.getByRole('textbox', { name: 'Zip Code' }).fill(address.zipcode);
    await this.page.getByRole('textbox', { name: 'Phone' }).fill(address.phone);
    
    return this;
  }

  /**
   * Continue to next step
   * @returns Promise resolving to this CheckoutPage instance 
   */
  async continueToNextStep(): Promise<CheckoutPage> {
    await this.page.getByRole('button', { name: 'Save and Continue' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Select shipping method
   * @param shippingMethodName Name of shipping method to select
   * @returns Promise resolving to this CheckoutPage instance 
   */
  async selectShippingMethod(shippingMethodName: string): Promise<CheckoutPage> {
    await this.page.getByText(shippingMethodName).click();
    return this;
  }

  /**
   * Fill payment information
   * @param paymentInfo Payment information
   * @returns Promise resolving to this CheckoutPage instance 
   */
  async fillPaymentInfo(paymentInfo: {
    cardholderName: string,
    cardNumber: string,
    expiryMonth: string,
    expiryYear: string,
    cvv: string
  }): Promise<CheckoutPage> {
    await this.page.getByRole('textbox', { name: 'Name on card' }).fill(paymentInfo.cardholderName);
    await this.page.getByRole('textbox', { name: 'Card Number' }).fill(paymentInfo.cardNumber);
    await this.page.getByLabel('Month').selectOption(paymentInfo.expiryMonth);
    await this.page.getByLabel('Year').selectOption(paymentInfo.expiryYear);
    await this.page.getByLabel('Card Verification Value (CVV)').fill(paymentInfo.cvv);
    
    return this;
  }

  /**
   * Place order (final confirmation)
   * @returns Promise resolving to void
   */
  async placeOrder(): Promise<void> {
    await this.page.getByRole('button', { name: 'Place Order' }).click();
    await Helpers.waitForPageStable(this.page);
  }

  /**
   * Get order number from confirmation page
   * @returns Promise resolving to order number
   */
  async getOrderNumber(): Promise<string> {
    const orderNumberText = await this.page.getByText(/Order #/).textContent();
    return orderNumberText?.replace('Order #', '').trim() || '';
  }

  /**
   * Get order total
   * @returns Promise resolving to order total as string
   */
  async getOrderTotal(): Promise<string> {
    const totalText = await this.page.getByText(/Order Total: \$/).textContent();
    return totalText?.trim() || '';
  }

  /**
   * Check if order was successful
   * @returns Promise resolving to boolean
   */
  async isOrderSuccessful(): Promise<boolean> {
    return await this.page.getByText('Thank You For Your Order').isVisible();
  }

  /**
   * Complete checkout in one go
   * @param userInfo User information including address and payment details
   * @returns Promise resolving to order number if successful
   */
  async completeCheckout(userInfo: {
    email: string,
    createAccount?: boolean,
    subscribeToNewsletter?: boolean,
    address: {
      firstName: string,
      lastName: string,
      address1: string,
      address2?: string,
      city: string,
      zipcode: string,
      phone: string,
      state: string,
      country: string
    },
    shipping: string,
    payment: {
      cardholderName: string,
      cardNumber: string,
      expiryMonth: string,
      expiryYear: string,
      cvv: string
    }
  }): Promise<string> {
    // Step 1: Email/Login info
    await this.continueAsGuest(
      userInfo.email, 
      userInfo.subscribeToNewsletter || false, 
      userInfo.createAccount || false
    );
    
    // Step 2: Address
    await this.fillBillingAddress(userInfo.address);
    await this.continueToNextStep();
    
    // Step 3: Shipping
    await this.selectShippingMethod(userInfo.shipping);
    await this.continueToNextStep();
    
    // Step 4: Payment
    await this.fillPaymentInfo(userInfo.payment);
    await this.continueToNextStep();
    
    // Step 5: Place order
    await this.placeOrder();
    
    // Return order number if successful
    if (await this.isOrderSuccessful()) {
      return await this.getOrderNumber();
    }
    
    return '';
  }

  /**
   * Verify email is shown
   * @param email Email address
   * @returns Promise resolving to void
   */
  async verifyEmailShown(email: string) {
    await expect(this.page.getByText(email.toLowerCase())).toBeVisible();
  }

  /**
   * Enter email
   * @param email Email address
   * @returns Promise resolving to void
   */
  async enterEmail(email: string) {
    await this.page.locator('#order_ship_address_attributes_email').fill(email);
  }
} 