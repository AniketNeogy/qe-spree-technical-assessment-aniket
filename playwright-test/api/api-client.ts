import { APIRequestContext, test as base, BrowserContext, Page } from "@playwright/test";
import path from "path";
import fs from "fs/promises";

/**
 * Authentication fixtures for API testing
 */
type AuthFixtures = {
  authenticatedPage: Page;
  authContext: BrowserContext;
  userEmail: string;
};

const authUser = base.extend<AuthFixtures>({
  authenticatedPage: async ({ browser, request }, use) => {
    const email = `user${Date.now()}@example.com`;
    const storagePath = path.resolve(__dirname, "../storage/user.json");

    await createAndLoginUser(
      request,
      {
        email,
        password: generateRandomString(),
      },
      storagePath
    );

    const context = await browser.newContext({ storageState: storagePath });
    const page = await context.newPage();

    await use(page);
    await context.close();
  },

  authContext: async ({ browser }, use) => {
    const storagePath = path.resolve(__dirname, "../storage/user.json");
    const context = await browser.newContext({ storageState: storagePath });
    await use(context);
    await context.close();
  },

  userEmail: async ({}, use) => {
    const email = `user${Date.now()}@example.com`;
    await use(email);
  },
});

/**
 * Generate a random string for password
 */
function generateRandomString(length = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Create and login user
 */
async function createAndLoginUser(
  request: APIRequestContext,
  userData: { email: string; password: string },
  storageFilePath: string = path.resolve(__dirname, "../storage/user.json")
): Promise<string> {
  // API request to create a new user
  const signupPage = await request.get("/users/sign_up");
  const signupHtml = await signupPage.text();
  const signupToken = extractAuthenticityToken(signupHtml);

  await request.post("/users", {
    form: {
      authenticity_token: signupToken,
      "user[email]": userData.email,
      "user[password]": userData.password,
      "user[password_confirmation]": userData.password,
      commit: "Sign Up",
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  // API login with the new user
  const loginPage = await request.get("/users/sign_in");
  const loginHtml = await loginPage.text();
  const loginToken = extractAuthenticityToken(loginHtml);

  const loginRes = await request.post("/users/sign_in", {
    form: {
      authenticity_token: loginToken,
      "user[email]": userData.email,
      "user[password]": userData.password,
      "user[remember_me]": "0",
      commit: "Login",
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (![200].includes(loginRes.status())) {
    throw new Error(`User login failed: ${loginRes.status()}`);
  }
  // store authenticated state
  const state = await request.storageState();
  await fs.mkdir(path.dirname(storageFilePath), { recursive: true });
  await fs.writeFile(storageFilePath, JSON.stringify(state, null, 2));

  return storageFilePath;
}

/**
 * Extract authenticity token from HTML
 */
function extractAuthenticityToken(html: string): string {
  const match = html.match(/name="authenticity_token" value="([^"]+)"/);
  if (!match || !match[1]) {
    throw new Error("authenticity_token not found");
  }
  return match[1];
}

/**
 * API Client for Payment Processing Validation (E2E-04)
 */
export class ApiClient {
  private baseUrl: string;
  private request: APIRequestContext;
  private token: string | null = null;

  constructor(request: APIRequestContext, baseUrl: string = 'http://localhost:3000') {
    this.request = request;
    this.baseUrl = baseUrl;
  }

  /**
   * Create new product cart (order)
   */
  async createCart() {
    const response = await this.request.post(`${this.baseUrl}/api/v2/storefront/cart`, {
      headers: this.getAuthHeaders()
    });
    
    if (response.ok()) {
      return await response.json();
    } else {
      throw new Error(`Failed to create cart: ${response.statusText()}`);
    }
  }

  /**
   * Add item to cart
   */
  async addItemToCart(cartId: string, variantId: string, quantity: number) {
    const response = await this.request.post(`${this.baseUrl}/api/v2/storefront/cart/add_item`, {
      headers: this.getAuthHeaders(),
      data: {
        variant_id: variantId,
        quantity: quantity,
        order_id: cartId
      }
    });
    
    if (response.ok()) {
      return await response.json();
    } else {
      throw new Error(`Failed to add item to cart: ${response.statusText()}`);
    }
  }

  /**
   * Get cart information
   */
  async getCart(cartId: string) {
    const response = await this.request.get(`${this.baseUrl}/api/v2/storefront/cart/${cartId}`, {
      headers: this.getAuthHeaders()
    });
    
    if (response.ok()) {
      return await response.json();
    } else {
      throw new Error(`Failed to get cart: ${response.statusText()}`);
    }
  }

  /**
   * Add shipping address to cart
   */
  async addShippingAddress(cartId: string, address: any) {
    const response = await this.request.put(`${this.baseUrl}/api/v2/storefront/checkout/${cartId}/shipping`, {
      headers: this.getAuthHeaders(),
      data: {
        shipping_address: address
      }
    });
    
    if (response.ok()) {
      return await response.json();
    } else {
      throw new Error(`Failed to add shipping address: ${response.statusText()}`);
    }
  }

  /**
   * Add billing address to cart
   */
  async addBillingAddress(cartId: string, address: any) {
    const response = await this.request.put(`${this.baseUrl}/api/v2/storefront/checkout/${cartId}/billing`, {
      headers: this.getAuthHeaders(),
      data: {
        billing_address: address
      }
    });
    
    if (response.ok()) {
      return await response.json();
    } else {
      throw new Error(`Failed to add billing address: ${response.statusText()}`);
    }
  }

  /**
   * Select shipping method
   */
  async selectShippingMethod(cartId: string, shippingMethodId: string) {
    const response = await this.request.patch(`${this.baseUrl}/api/v2/storefront/checkout/${cartId}/select_shipping_method`, {
      headers: this.getAuthHeaders(),
      data: {
        shipping_method_id: shippingMethodId
      }
    });
    
    if (response.ok()) {
      return await response.json();
    } else {
      throw new Error(`Failed to select shipping method: ${response.statusText()}`);
    }
  }

  /**
   * Add payment method to cart
   */
  async addPaymentMethod(cartId: string, paymentMethodId: string, cardDetails: any) {
    const response = await this.request.post(`${this.baseUrl}/api/v2/storefront/checkout/${cartId}/payments`, {
      headers: this.getAuthHeaders(),
      data: {
        payment_method_id: paymentMethodId,
        source_attributes: cardDetails
      }
    });
    
    if (response.ok()) {
      return await response.json();
    } else {
      throw new Error(`Failed to add payment method: ${response.statusText()}`);
    }
  }

  /**
   * Process payment
   */
  async processPayment(cartId: string, paymentData: any) {
    const response = await this.request.post(`${this.baseUrl}/api/v2/storefront/checkout/${cartId}/payment`, {
      headers: this.getAuthHeaders(),
      data: paymentData
    });
    
    return {
      status: response.status(),
      data: response.ok() ? await response.json() : null,
      error: !response.ok() ? await response.text() : null
    };
  }

  /**
   * Complete checkout
   */
  async completeCheckout(cartId: string) {
    const response = await this.request.patch(`${this.baseUrl}/api/v2/storefront/checkout/${cartId}/complete`, {
      headers: this.getAuthHeaders()
    });
    
    return {
      status: response.status(),
      data: response.ok() ? await response.json() : null,
      error: !response.ok() ? await response.text() : null
    };
  }

  /**
   * Get order status
   */
  async getOrder(orderNumber: string) {
    const response = await this.request.get(`${this.baseUrl}/api/v2/storefront/orders/${orderNumber}`, {
      headers: this.getAuthHeaders()
    });
    
    if (response.ok()) {
      return await response.json();
    } else {
      throw new Error(`Failed to get order: ${response.statusText()}`);
    }
  }

  /**
   * Mock payment processing
   * This simulates a payment provider response
   */
  mockPaymentProcessing(paymentDetails: any): {
    success: boolean; 
    message?: string;
    transaction_id?: string;
    status_code: number;
  } {
    const { cardNumber, cvv } = paymentDetails;
    
    // Simulate various payment scenarios
    
    // Declined payment
    if (cardNumber === '4000000000000002') {
      return {
        success: false,
        message: 'Card declined',
        status_code: 422
      };
    }
    
    // Invalid CVV
    if (cvv === '000') {
      return {
        success: false,
        message: 'Invalid security code',
        status_code: 422
      };
    }
    
    // Card expired
    if (paymentDetails.expiryDate === '01/2020') {
      return {
        success: false,
        message: 'Card expired',
        status_code: 422
      };
    }
    
    // Network error
    if (cardNumber === '4000000000000101') {
      return {
        success: false,
        message: 'Network error, please retry',
        status_code: 500
      };
    }
    
    // Successful payment
    return {
      success: true,
      transaction_id: `txn_${Date.now()}`,
      status_code: 200
    };
  }

  /**
   * Prepare authorization headers
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }
}

export { authUser, createAndLoginUser }; 