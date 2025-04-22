import { Page } from '@playwright/test';
import { BasePage } from './base-page';
import { ProductPage } from './product-page';
import { Helpers } from '../utils/helpers';

/**
 * NewArrivalsPage Page Object Model
 * Represents the new arrivals page of the Spree Commerce application
 */
export class NewArrivalsPage extends BasePage {
  /**
   * Constructor
   * @param page Playwright page object
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the new arrivals page
   * @returns Promise resolving to this NewArrivalsPage instance 
   */
  async goto(): Promise<this> {
    await super.goto('/t/collections/new-arrivals');
    return this;
  }

  /**
   * Check if new arrivals banner is visible
   * @returns Promise resolving to true if the banner is visible, false otherwise
   */
  async isNewArrivalsBannerVisible(): Promise<boolean> {
    return await this.page.getByText('Collection New arrivals').isVisible();
  }

  /**
   * Get the count of products on the page
   * @returns Promise resolving to the number of products
   */
  async getProductCount(): Promise<number> {
    const products = this.page.locator('#product-card-1, [id^="product-card-"]');
    return await products.count();
  }

  /**
   * Click a product by its name
   * @param productName The name of the product to click
   * @returns Promise resolving to a new ProductPage instance
   */
  async clickProductByName(productName: string): Promise<ProductPage> {
    await this.page.getByRole('link', { name: new RegExp(`${productName}.*\\$`) }).click();
    await Helpers.waitForPageStable(this.page);
    return new ProductPage(this.page);
  }

  /**
   * Add a product to wishlist by product card ID
   * @param productId The ID of the product card (default is 3)
   * @returns Promise resolving to this NewArrivalsPage instance 
   */
  async addProductToWishlist(productId: number = 3): Promise<this> {
    await this.page.locator(`#product-card-${productId}`).getByRole('button', { name: 'Add to wishlist' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

} 