import { expect, Page } from '@playwright/test';
import { Helpers } from '../utils/helpers';
import { BasePage } from './base-page';
import { TestData } from '../fixtures/test-data';

/**
 * Page Object Model for the Spree Commerce Cart Page
 */
export class CartPage extends BasePage {

  /**
   * Constructor
   * @param page Playwright page object
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to cart page
   * @returns Promise resolving to this CartPage instance
   */
  async goto(): Promise<this> {              
    await super.goto('/cart');
    return this;
  }

  /**
   * Check if cart is empty
   * @returns Promise resolving to true if cart is empty, false otherwise
   */
  async isCartEmpty(): Promise<boolean> {
    return await this.page.getByText('Your cart is empty.').isVisible();
  }

  /**
   * Get the number of items in cart
   * @returns Promise resolving to the number of items in cart
   */
  async getItemCount(): Promise<number> {
    if (await this.isCartEmpty()) {
      return 0;
    }
    // Count line items by checking all elements with id starting with line_item_
    return await this.page.locator('[id^="line_item_"]').count();
  }

  /**
   * Get cart total
   * @returns Promise resolving to the cart total as a string
   */
  async getCartTotal(): Promise<string> {
    const totalText = await this.page.locator('.shopping-cart-total-amount').textContent();
    return totalText?.trim() || '';
  }

  /**
   * Update item quantity by line item ID
   * @param lineItemId The ID of the line item
   * @param quantity The new quantity
   * @returns Promise resolving to this CartPage instance 
   */
  async updateQuantity(lineItemId: string, quantity: number): Promise<CartPage> {
    // Click the quantity input
    await this.page.locator(`#${lineItemId}`).getByRole('spinbutton').click();
    // Clear and type the new quantity
    await this.page.locator(`#${lineItemId}`).getByRole('spinbutton').clear();
    await this.page.locator(`#${lineItemId}`).getByRole('spinbutton').fill(quantity.toString());
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Increase quantity by clicking the + button
   * @param lineItemId The ID of the line item
   * @returns Promise resolving to this CartPage instance 
   */
  async increaseQuantity(lineItemId: string): Promise<CartPage> {
    await this.page.locator(`#${lineItemId}`).getByRole('button').nth(2).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Decrease quantity by clicking the - button
   * @param lineItemId The ID of the line item
   * @returns Promise resolving to this CartPage instance 
   */
  async decreaseQuantity(lineItemId: string): Promise<CartPage> {
    await this.page.locator(`#${lineItemId}`).getByRole('button').nth(1).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Remove item from cart
   * @param lineItemId The ID of the line item
   * @returns Promise resolving to this CartPage instance 
   */
  async removeItem(lineItemId: string): Promise<CartPage> {
    await this.page.locator(`#${lineItemId}`).getByRole('button').first().click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Close the cart sidebar
   * @returns Promise resolving to this CartPage instance 
   */
  async closeCartSidebar(): Promise<this> {
    await this.page.getByRole('button', { name: 'Close sidebar' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Proceed to checkout
   * @returns Promise resolving to void
   */
  async proceedToCheckout(): Promise<void> {
    await this.page.getByRole('link', { name: 'Checkout' }).click();
    //add a wait for the page to load 
   
    await Helpers.waitForPageStable(this.page);
  }

  /**
   * Continue shopping (go back to store)
   * @returns Promise resolving to void
   */
  async continueShopping(): Promise<void> {
    await this.page.getByText('Continue shopping').click();
    await Helpers.waitForPageStable(this.page);
  }

  /**
   * Get the name of a specific item in the cart
   * @param lineItemId The ID of the line item
   * @returns Promise resolving to the item name
   */
  async getItemName(lineItemId: string): Promise<string> {
    const name = await this.page.locator(`#${lineItemId}`).getByRole('link').first().textContent();
    return name?.trim() || '';
  }

  /**
   * Get the color of a specific item in the cart
   * @param lineItemId The ID of the line item
   * @returns Promise resolving to the item color
   */
  async getItemColor(lineItemId: string): Promise<string> {
    const color = await this.page.locator(`#${lineItemId}`).getByText(/\w+/, { exact: true }).textContent();
    return color?.trim() || '';
  }

  /**
   * Get the price of a specific item in the cart
   * @param lineItemId The ID of the line item
   * @returns Promise resolving to the item price
   */
  async getItemPrice(lineItemId: string): Promise<string> {
    const priceText = await this.page.locator(`#${lineItemId}`).getByText(/\$/).textContent();
    return priceText?.trim() || '';
  }

  /**
   * Verify item is in cart
   * @param lineItemId The ID of the line item
   * @param expectedText Text that should be present for the item
   * @returns Promise resolving to boolean indicating if the item is found with expected text
   */
  async verifyItemInCart(lineItemId: string, expectedText: string): Promise<boolean> {
    const itemElement = this.page.locator(`#${lineItemId}`);
    return await itemElement.getByText(expectedText).isVisible();
  }

  /**
   * Verify the cart total
   * @param price The price of the product
   */
  async verifyProductNameAddedToCart(name: string) {
    await expect(this.page.getByRole('link', { name: name, exact: true })).toBeVisible();
 
  }

  /**
   * Verify the cart page
   * @param price The price of the product
   */
  async verifyProductPriceAddedToCart(price: string) {  
    await expect(this.page.locator('#cart_summary').first()).toContainText(`$`);  
  }

  /**
   * Verify the cart items count
   * @param count The number of items in the cart
   */
  async checkCartItemsCount(count: number) {
    await expect(this.page.locator('[data-reveal-target="item"]')).toHaveCount(count);
  }
} 