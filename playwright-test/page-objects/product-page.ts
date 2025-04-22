import { expect, Page } from '@playwright/test';
import { Helpers } from '../utils/helpers';
import { BasePage } from './base-page';
import { CartPage } from './cart-page';

/**
 * ProductPage Page Object Model
 * Represents a product detail page in the Spree Commerce application
 */
export class ProductPage extends BasePage {
 
  /**
   * Constructor
   * @param page Playwright page object
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to a specific product page
   * @param productSlug The product slug
   * @returns Promise resolving to this ProductPage instance 
   */
  async goto(productSlug: string): Promise<this> {
    await super.goto(`/products/${productSlug}`);
    return this;
  }

  /**
   * Returns the product name displayed on the page
   */
  async getProductName(): Promise<string> {
    const productName = await this.page.getByRole('heading').first().textContent();
    return productName?.trim() || '';
  }

  /**
   * Returns the product price displayed on the page
   */
  async getProductPrice(): Promise<string> {
    const price = await this.page.getByRole('paragraph').filter({ hasText: '$' }).textContent();
    return price?.trim() || '';
  }

  /**
   * Gets the product description
   */
  async getProductDescription(): Promise<string> {
    const description = await this.page.locator('#product-details-page p').first().textContent();
    return description?.trim() || '';
  }

  /**
   * Gets the product color
   */
  async getProductColor(): Promise<string> {
    const colorText = await this.page.getByText(/Color:/).textContent();
    return colorText?.replace('Color:', '').trim() || '';
  }

  /**
   * Selects a specific size option for the product
   * @param size The size to select (e.g. 'S', 'M', 'L')
   */
  async selectSize(size: string): Promise<ProductPage> {
    await this.page.getByRole('button', { name: 'Please choose Size' }).click();
    await this.page.locator('label').filter({ hasText: size }).first().click();
    return this;
  }

  /**
   * Selects a specific color option for the product
   * @param color The color to select
   */
  async selectColor(color: string): Promise<ProductPage> {
    await this. page.getByRole('group').filter({ hasText: `Color: ${color}` }).locator('div').nth(1).click();
    return this;
  }

  /**
   * Sets the quantity for the product
   * @param quantity The quantity to set
   */
  async setQuantity(quantity: number): Promise<ProductPage> {
    await this.page.getByRole('spinbutton', { name: 'Quantity' }).clear();
    await this.page.getByRole('spinbutton', { name: 'Quantity' }).fill(quantity.toString());
    return this;
  }

  /**
   * Adds the product to the cart with the currently selected options
   * @returns The current ProductPage instance
   */
  async addToCart(): Promise<CartPage> {
    await this.page.getByRole('button', { name: 'Add To Cart' }).click();
    // Wait for the cart modal or page to appear
    await Helpers.waitForPageStable(this.page);
    await this.goToCart();
    return new CartPage(this.page);
  }

  /**
   * Navigate to the cart page
   * @returns Promise resolving to this instance for method chaining
   */
  override async goToCart(): Promise<this> {
    await this.page.getByRole('link', { name: 'Items in cart, View bag' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Get CartPage instance after navigating to Cart
   * @returns A new CartPage instance
   */
  async getCartPage(): Promise<CartPage> {
    await this.goToCart();
    return new CartPage(this.page);
  }

  /**
   * Add product to wishlist
   * @returns Promise resolving to this ProductPage instance 
   */
  async addToWishlist(): Promise<ProductPage> {
    await this.page.getByRole('button', { name: 'Add to wishlist' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Click on a thumbnail image
   * @param index The index of the thumbnail to click (0-based)
   * @returns Promise resolving to this ProductPage instance 
   */
  async clickThumbnail(index: number): Promise<ProductPage> {
    const thumbnails = this.page.locator('[role="img"]');
    const count = await thumbnails.count();
    
    if (index >= count) {
      throw new Error(`Thumbnail index ${index} is out of range (0-${count-1})`);
    }
    
    await thumbnails.nth(index).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Checks if the product is in stock
   */
  async isInStock(): Promise<boolean> {
    return await this.page.locator('#product-details-page').getByText('In Stock').isVisible();
  }

   /**
   * Verify the product name
   * @param name The name of the product
   */       
   async verifyProductName(name: string) {
    await expect(this.page.locator('#product-details-page')).toContainText(name); 
  }
  
  /**
   * Verify the product price
   * @param price The price of the product
   */ 
  async verifyProductPrice(price: string) {
    await expect(this.page.locator('#product-details-page').first()).toContainText(`$${price}`);  
  }

} 