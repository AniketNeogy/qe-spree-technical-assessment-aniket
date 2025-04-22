import { Page } from '@playwright/test';
import { Helpers } from '../utils/helpers';

/**
 * Base Page Object Model
 * Provides common functionality shared across all page objects
 */
export class BasePage {
  protected page: Page;
  protected baseURL: string = 'http://localhost:3000';

  /**
   * Constructor
   * @param page Playwright page object
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific path
   * @param path Path to navigate to
   * @returns Promise resolving to this BasePage instance
   */
  async goto(path: string = '/'): Promise<this> {
    await this.page.goto(`${this.baseURL}${path}`);
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Search for a product
   * @param searchTerm The term to search for
   * @returns Promise resolving to the current page object
   */
  async search(searchTerm: string): Promise<this> {
    await this.page.getByRole('button', { name: 'Search' }).click();
    await this.page.getByRole('textbox', { name: 'Search' }).fill(searchTerm);
    await this.page.keyboard.press('Enter');
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Navigate to the Shop All page
   * @returns Promise resolving to this page instance
   */
  async goToShopAll(): Promise<this> {
    await this.page.getByLabel('Top').getByRole('link', { name: 'Shop All' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Navigate to the New Arrivals page
   * @returns Promise resolving to this page instance
   */
  async goToNewArrivals(): Promise<this> {
    await this.page.getByLabel('Top').getByRole('link', { name: 'New arrivals' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Navigate to the On Sale page
   * @returns Promise resolving to this page instance
   */
  async goToOnSale(): Promise<this> {
    await this.page.getByLabel('Top').getByRole('link', { name: 'On sale' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Navigate to the Blog page
   * @returns Promise resolving to this page instance
   */
  async goToBlog(): Promise<this> {
    await this.page.getByRole('link', { name: 'Blog' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Navigate to the Cart page
   * @returns Promise resolving to this page instance
   */
  async goToCart(): Promise<this> {
    await this.page.getByRole('link', { name: 'Items in cart, View bag' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Navigate to the Account page
   * @returns Promise resolving to this page instance
   */
  async goToAccount(): Promise<this> {
    await this.page.getByRole('navigation', { name: 'Top' }).getByRole('button').nth(1).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Navigate to the Wishlist page
   * @returns Promise resolving to this page instance
   */
  async goToWishlist(): Promise<this> {
    await this.page.locator('#wishlist-icon').click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Navigate to the home page using the logo
   * @returns Promise resolving to this page instance
   */
  async goToHome(): Promise<this> {
    await this.page.getByRole('link', { name: 'Spree Demo Site' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Close the cart sidebar if it's open
   * @returns Promise resolving to this page instance
   */
  async closeCartSidebar(): Promise<this> {
    await this.page.getByRole('button', { name: 'Close sidebar' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Proceed to checkout from the cart sidebar
   * @returns Promise resolving to this page instance
   */
  async checkoutFromSidebar(): Promise<this> {
    await this.page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Navigate to Privacy Policy from footer
   * @returns Promise resolving to this page instance
   */
  async goToPrivacyPolicy(): Promise<this> {
    await this.page.getByRole('link', { name: 'Privacy Policy' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Navigate to Terms of Service from footer
   * @returns Promise resolving to this page instance
   */
  async goToTermsOfService(): Promise<this> {
    await this.page.getByRole('link', { name: 'Terms of Service' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Navigate to My Account from footer
   * @returns Promise resolving to this page instance
   */
  async goToMyAccount(): Promise<this> {
    await this.page.getByRole('link', { name: 'My Account' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Navigate to Favorites from footer
   * @returns Promise resolving to this page instance
   */
  async goToFavorites(): Promise<this> {
    await this.page.getByRole('link', { name: 'Favorites' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Click on the sort button
   * @returns Promise resolving to this page instance
   */
  async clickSortButton(): Promise<this> {
    await this.page.locator('[data-test-id="sort-button"]').click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Sort products by the given option
   * @param option The sort option (e.g., 'Alphabetically, A-Z', 'Price (low-high)')
   * @returns Promise resolving to this page instance
   */
  async sortBy(option: string): Promise<this> {
    await this.clickSortButton();
    await this.page.getByText(option).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Open the filter panel
   * @returns Promise resolving to this page instance
   */
  async openFilterPanel(): Promise<this> {
    await this.page.getByRole('button', { name: 'Filter' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Set the price filter on product listing pages
   * @param minPrice Minimum price
   * @param maxPrice Maximum price
   * @returns Promise resolving to this page instance
   */
  async setPriceFilter(minPrice: number, maxPrice: number): Promise<this> {
    await this.openFilterPanel();
    await this.page.getByRole('link', { name: 'Price' }).click();
    
    const minInput = this.page.getByRole('spinbutton', { name: 'from $' });
    const maxInput = this.page.getByRole('spinbutton', { name: 'to $' });
    
    if (minPrice > 0) await minInput.fill(minPrice.toString());
    if (maxPrice > 0) await maxInput.fill(maxPrice.toString());
    
    return this;
  }

  /**
   * Apply the selected filters
   * @returns Promise resolving to this page instance
   */
  async applyFilters(): Promise<this> {
    await this.page.getByRole('button', { name: 'Apply' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Clear all filters
   * @returns Promise resolving to this page instance
   */
  async clearAllFilters(): Promise<this> {
    await this.openFilterPanel();
    await this.page.getByRole('link', { name: 'Clear all' }).click();
    await this.applyFilters();
    return this;
  }

  /**
   * Select a size filter
   * @param size The size to filter by (e.g., 'S', 'M', 'L')
   * @returns Promise resolving to this page instance
   */
  async selectSizeFilter(size: string): Promise<this> {
    await this.openFilterPanel();
    await this.page.getByRole('link', { name: 'Size' }).click();
    await this.page.getByRole('listitem').filter({ hasText: size }).locator('input[type="checkbox"]').check();
    await this.applyFilters();
    return this;
  }

  /**
   * Filter by stock status
   * @param stockFilter The stock filter label ('In Stock' or 'Out of Stock')
   * @returns Promise resolving to this page instance
   */
  async filterByInStock(stockFilter: string): Promise<this> {
    await this.openFilterPanel();
    await this.page.getByRole('link', { name: 'Availability' }).click();
    await this.page.getByRole('listitem').filter({ hasText: stockFilter }).locator('input[type="checkbox"]').check();
    await this.applyFilters();
    return this;
  }

  /**
   * Filter by price range
   * @param min Minimum price
   * @param max Maximum price
   * @returns Promise resolving to this page instance
   */
  async filterByPriceRange(min: number, max: number): Promise<this> {
    await this.setPriceFilter(min, max);
    await this.applyFilters();
    return this;
  }

  /**
   * Get current URL
   * @returns Promise resolving to the current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }
}   
