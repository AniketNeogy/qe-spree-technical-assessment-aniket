import { Page } from '@playwright/test';
import { Helpers } from '../utils/helpers';
import { BasePage } from './base-page';
import { ShopAllPage } from './shop-all-page';
import { NewArrivalsPage } from './new-arrivals-page'
import { CartPage } from './cart-page';
import { ProductPage } from './product-page';

/**
 * User registration data interface
 */
export interface UserRegistrationData {
  email: string;
  password: string;
  passwordConfirmation?: string;
}

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * HomePage Page Object Model
 * Represents the home page of the Spree Commerce application
 */
export class HomePage extends BasePage {
  // Modern approach using getByRole locators for better accessibility testing
  
  /**
   * Constructor
   * @param page Playwright page object
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the home page
   * @param path Optional path parameter (defaults to '/')
   * @returns Promise resolving to this instance
   */
  async goto(path: string = '/'): Promise<this> {
    await super.goto(path);
    return this;
  }

  /**
   * Open the account menu by clicking the account button
   * @returns Promise resolving to this instance
   */
  async openAccountMenu(): Promise<this> {
    await this.page.getByRole('button').nth(1).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Navigate to the sign up page
   * @returns Promise resolving to this instance
   */
  async navigateToSignUp(): Promise<this> {
    await this.openAccountMenu();
    await this.page.getByRole('link', { name: 'Sign Up' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Register a new user account
   * @param userData User registration data containing email and password
   * @returns Promise resolving to this instance
   */
  async registerNewUser(userData: UserRegistrationData): Promise<this> {
    await this.navigateToSignUp();
    
    // Fill in registration form
    await this.page.getByRole('textbox', { name: 'Email', exact: true }).pressSequentially(userData.email);
    await this.page.getByRole('textbox', { name: 'Password', exact: true }).pressSequentially(userData.password);
    
    // If password confirmation is provided, use it; otherwise, use the password
    const passwordConfirmation = userData.passwordConfirmation || userData.password;
    await this.page.getByRole('textbox', { name: 'Password Confirmation' }).pressSequentially(passwordConfirmation);
    
    // Submit registration form
    await this.page.getByRole('button', { name: 'Sign Up' }).click();
    await Helpers.waitForPageStable(this.page);
    
    return this;
  }

  /**
   * Logout the current user
   * @returns Promise resolving to this instance
   */
  async logout(): Promise<this> {
    await this.page.getByRole('button', { name: 'Logout' }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Login with the provided credentials
   * @param credentials Login credentials containing email, password, and optional rememberMe flag
   * @returns Promise resolving to this instance
   */
  async login(credentials: LoginCredentials): Promise<this> {
    await this.openAccountMenu();
    
    // Fill in login form
    await this.page.getByRole('textbox', { name: 'Email', exact: true }).fill(credentials.email);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(credentials.password);
    
    // Check "Remember me" if specified
    if (credentials.rememberMe) {
      await this.page.getByRole('checkbox', { name: 'Remember me' }).check();
    }
    
    // Submit login form
    await this.page.getByRole('button', { name: 'Login' }).click();
    await Helpers.waitForPageStable(this.page);
    
    return this;
  }

  /**
   * Verify if user is logged in
   * @param email User's email to verify
   * @returns Promise resolving to boolean indicating if user is logged in
   */
  async isUserLoggedIn(email: string): Promise<boolean> {
    return await this.page.getByText(`Logged in as ${email}`).isVisible();
  }

  /**
   * Click the welcome banner
   * @returns Promise resolving to this instance
   */
  async clickWelcomeBanner(): Promise<this> {
    await this.page.getByRole('link', { name: 'Welcome to our shop!', exact: true }).click();
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Click Shop All in the main content section
   * @returns Promise resolving to ShopAllPage instance
   */
  async clickShopAllFromMain(): Promise<ShopAllPage> {
    await this.page.getByRole('main').getByText('Shop All').click();
    await Helpers.waitForPageStable(this.page);
    return new ShopAllPage(this.page);
  }

  /**
   * Click on a specific product (Covered Placket Shirt)
   * @returns Promise resolving to a product page
   */
  async clickCoveredPlacketShirt(productName: string): Promise<ProductPage> {
    await this.page.getByRole('link', { name: `${productName}$` }).click();
    await Helpers.waitForPageStable(this.page);
    return new ProductPage(this.page); // Return type may need to be changed if specific page object exists
  }

  /**
   * Navigate to the Shop All page
   * @returns Promise resolving to this instance for method chaining
   */
  override async goToShopAll(): Promise<this> {
    // Navigate directly to the Shop All page instead of using parent method
    await this.page.getByLabel('Top').getByRole('link', { name: 'Shop All' }).click();
    // Wait for navigation and page to be stable
    await Helpers.waitForPageStable(this.page);
    return this;
  }

  /**
   * Get ShopAllPage instance after navigating to Shop All
   * @returns Promise resolving to a ShopAllPage instance
   */
  async getShopAllPage(): Promise<ShopAllPage> {
    await this.goToShopAll();
    return new ShopAllPage(this.page);
  }

  /**
   * Navigate to the New Arrivals page
   * @returns Promise resolving to this instance for method chaining
   */
  override async goToNewArrivals(): Promise<this> {
    await super.goToNewArrivals();
    return this;
  }

  /**
   * Get NewArrivalsPage instance after navigating to New Arrivals
   * @returns Promise resolving to a NewArrivalsPage instance
   */
  async getNewArrivalsPage(): Promise<NewArrivalsPage> {
    await this.goToNewArrivals();
    return new NewArrivalsPage(this.page);
  }

  /**
   * Navigate to the Cart page
   * @returns Promise resolving to this instance for method chaining
   */
  override async goToCart(): Promise<this> {
    await super.goToCart();
    return this;
  }

  /**
   * Get CartPage instance after navigating to Cart
   * @returns Promise resolving to a CartPage instance
   */
  async getCartPage(): Promise<CartPage> {
    await this.goToCart();
    return new CartPage(this.page);
  }

  /**
   * Search for products and return a ShopAllPage instance
   * @param searchTerm The term to search for
   * @returns Promise resolving to a ShopAllPage instance
   */
  async searchProduct(searchTerm: string): Promise<ShopAllPage> {
    await super.search(searchTerm);
    return new ShopAllPage(this.page);
  }

  /**
   * Verify if the welcome message is visible
   * @returns Promise resolving to boolean indicating if welcome message is visible
   */
  async verifyWelcomeMessage(welcomeText: string): Promise<boolean> {
    return await this.page.getByText(welcomeText).isVisible();
  }
} 