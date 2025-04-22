import { expect, Page } from '@playwright/test';
import { Helpers } from '../utils/helpers';
import { BasePage } from './base-page';
import { ProductPage } from './product-page';
import { TestData } from '../fixtures/test-data';

/**
 * ShopAllPage Page Object Model
 * Represents the shop all products page of the Spree Commerce application
 */
export class ShopAllPage extends BasePage {
  // Shop All page specific elements
  readonly filterCheckboxes = '[data-test="filter-checkbox"]';

  /**
   * Constructor
   * @param page Playwright page object
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the shop all page
   * @returns Promise resolving to this ShopAllPage instance 
   */
  async goto(): Promise<this> {
    await super.goto('/products');
    return this;
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
   * Get the page title
   * @returns Promise resolving to the page title
   */
  async getPageTitle(): Promise<string | null> {
    const heading = this.page.getByRole('heading', { name: 'Shop All' });
    return await heading.textContent();
  }

  /**
   * Click a product by its name
   * @param productName The name of the product to click
   * @returns Promise resolving to a new ProductPage instance
   */
  async clickProductByName(productName: string): Promise<ProductPage> {
    await this.page.getByRole('link', { name: `${productName}` }).click();
    await Helpers.waitForPageStable(this.page);
    return new ProductPage(this.page);
  }

  /**
   * Add a product to wishlist by product card ID
   * @param productId The ID of the product card (default is 1)
   * @returns Promise resolving to this ShopAllPage instance 
   */
  async addProductToWishlist(productId: number = 1): Promise<this> {
    await this.page.locator(`#product-card-${productId}`).getByRole('button', { name: 'Add to wishlist' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Remove a product from wishlist
   * @returns Promise resolving to this ShopAllPage instance 
   */
  async removeProductFromWishlist(): Promise<this> {
    await this.page.getByRole('button', { name: 'Remove from wishlist' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Close the account sidebar
   * @returns Promise resolving to this ShopAllPage instance 
   */
  async closeAccountSidebar(): Promise<this> {
    await this.page.getByRole('button', { name: 'Close account sidebar' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Go to the wishlist
   * @returns Promise resolving to this ShopAllPage instance 
   */
  async goToWishlist(): Promise<this> {
    await this.page.locator('#wishlist-icon').click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Go to the cart
   * @returns Promise resolving to this ShopAllPage instance 
   */
  async goToCart(): Promise<this> {
    await this.page.getByRole('link', { name: 'Items in cart, View bag' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Filter by men's category
   * @returns Promise resolving to this ShopAllPage instance 
   */
  async filterByMensCategory(): Promise<this> {
    await this.openFilterPanel();
    await this.page.getByRole('link', { name: 'Category' }).click();
    await this.page.getByRole('listitem').filter({ hasText: 'Men (35)' }).locator('[id="filter\\[taxon_ids\\]\\[\\]"]').check();
    await this.applyFilters();
    return this;
  }

  /**
   * Check if out of stock filter is available
   * @returns Promise resolving to boolean indicating if out of stock filter is displayed
   */
  async hasOutOfStockFilter(): Promise<boolean> {
    return await this.page.getByText('Out of Stock (0)').isVisible();
  }

  /**
   * Verify the shop all page
   * @param shopAll The text of the shop all page
   * @returns Promise resolving to this ShopAllPage instance 
   */
  async verifyShopAllPage(shopAll: string) {
    await expect(this.page.getByRole('heading', { name: shopAll })).toBeVisible();
    return this;
  }
}