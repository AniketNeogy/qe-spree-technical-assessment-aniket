import { expect, Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

/**
 * Helper functions for common operations in tests
 */
export class Helpers {
  /**
   * Wait for the page to be in a stable state (no network activity, animations, etc.)
   * @param page Playwright page object
   * @param timeout Timeout in milliseconds
   */
  static async waitForPageStable(page: Page, timeout = 30000): Promise<void> {
    try {
      await page.waitForLoadState('networkidle', { timeout }).catch(() => {
        console.log('Network idle timeout, continuing anyway');
      });
    } catch (error) {
      console.log('Error waiting for network idle, continuing anyway:', error);
    }

    try {
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
    } catch (error) {
      console.log('Error waiting for DOM content, continuing anyway:', error);
    }
    
    await page.waitForTimeout(500);
  }

  /**
   * Generate a random email for test accounts
   * @deprecated Use faker.internet.email() directly instead
   */
  static generateRandomEmail(): string {
    return faker.internet.email();
  }

  /**
   * Generate random string of specified length
   * @deprecated Use faker.string.alphanumeric(length) instead
   */
  static generateRandomString(length = 10): string {
    return faker.string.alphanumeric(length);
  }

  /**
   * Verify an element is visible and contains the expected text
   */
  static async verifyElementText(page: Page, selector: string, expectedText: string): Promise<void> {
    const element = page.locator(selector);
    await expect(element).toBeVisible();
    await expect(element).toContainText(expectedText);
  }

  /**
   * Clear an input field and type new value
   */
  static async clearAndType(page: Page, selector: string, text: string): Promise<void> {
    const input = page.locator(selector);
    await input.click();
    await input.clear();
    await input.type(text);
  }
} 