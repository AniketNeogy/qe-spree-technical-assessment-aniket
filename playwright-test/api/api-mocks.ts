import { Page } from '@playwright/test';

/**
 * Mock functions for API testing
 */
export class ApiMocks {
  /**
   * Mock the payment and order confirmation flow
   * @param page Playwright page
   * @param orderToken Checkout token
   * @param firstName Customer first name for confirmation message
   * @param productName Product name
   * @param productPrice Product price
   * @returns Promise resolving to the mocked order number
   */
  static async mockOrderConfirmation(
    page: Page, 
    orderToken: string, 
    firstName: string,
    productName: string,
    productPrice: number
  ): Promise<string> {
    // Generate a random order number
    const orderNumber = `R${Math.floor(Math.random() * 1000000000)}`;
    
    // Create mock HTML for the order confirmation page
    const mockOrderConfirmationHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Confirmation</title>
      </head>
      <body>
        <div id="content" data-hook="">
          <div class="container">
            <div class="checkout-confirm">
              <div class="row">
                <div class="col-lg-8">
                  <div class="d-flex flex-sm-row flex-column justify-content-center">
                    <div class="text-center checkout-header-center">
                      <div class="shop text-uppercase">SHOP</div>
                    </div>
                  </div>
                  <div class="order-confirm-delivery-informations">
                    <h3>Order ${orderNumber}</h3>
                    <h4 class="text-success text-uppercase">Thanks ${firstName} for your order!</h4>
                    <div>
                      <div>Your order is confirmed!</div>
                      <div>When your order is ready, you will receive an email confirmation.</div>
                    </div>
                    <div id="checkout_line_items">
                      <div>
                        <div>${productName}</div>
                        <div>Color: Dark Blue, Size: S</div>
                        <div>$${productPrice.toFixed(2)}</div>
                      </div>
                    </div>
                    <div id="checkout_summary">
                      <div>Subtotal: $${productPrice.toFixed(2)}</div>
                      <div>Shipping: $5.00</div>
                      <div>Total USD $${(productPrice + 5).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Set up route interceptors
    
    // 1. Handle the payment update endpoint
    await page.route("**/checkout/**/update/payment", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
    
    // 2. Handle the confirm endpoint with redirect to complete
    await page.route("**/checkout/**/update/confirm", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: true,
          redirect_path: `/checkout/${orderToken}/complete`
        })
      });
    });
    
    // 3. Intercept all checkout page requests after payment - redirect to complete
    await page.route("**/checkout/**", async (route) => {
      const url = route.request().url();
      
      // Skip interception if already going to complete page
      if (url.includes('/complete')) {
        await route.continue();
        return;
      }
      
      // If it's the payment page or any other checkout page
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 302,
          headers: {
            'Location': `http://localhost:3000/checkout/${orderToken}/complete`
          },
          body: ''
        });
      } else {
        await route.continue();
      }
    });
    
    // 4. Mock the complete page with our HTML
    await page.route(`**/checkout/${orderToken}/complete`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: mockOrderConfirmationHTML
      });
    });

    return orderNumber;
  }
} 