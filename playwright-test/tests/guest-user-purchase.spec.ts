import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/home-page';
import { CheckoutPage } from '../page-objects/checkout-page';
import { DeliveryPage } from '../page-objects/delivery-page';
import { TestData } from '../fixtures/test-data';
import { ApiMocks } from '../api/api-mocks';

/**
 * E2E-02: Complete Purchase Flow (Guest User) using credit card payment
 */
test('E2E-02: Guest User purchase flow', async ({ page }) => {
  const testUser = TestData.users.testUser;
  const shippingAddress = TestData.address;

  const homePage = new HomePage(page);
  await homePage.goto();
  
  const shopAllPage = await homePage.getShopAllPage();
  await shopAllPage.verifyShopAllPage(TestData.constants.shopAll);
  
  const productPage = await shopAllPage.clickProductByName(TestData.products.tshirt.name);
  await productPage.verifyProductName(TestData.products.tshirt.name); 
  await productPage.verifyProductPrice(TestData.products.tshirt.price.toString());
  await productPage.selectColor(TestData.constants.clothColor.blue);
  await productPage.selectSize(TestData.constants.clothSize.large);
  
  const cartPage = await productPage.addToCart();
  await cartPage.verifyProductNameAddedToCart(TestData.products.tshirt.name);
  await cartPage.verifyProductPriceAddedToCart(TestData.products.tshirt.price.toString());
  
  await cartPage.proceedToCheckout();
  const checkoutPage = new CheckoutPage(page);
  
  await checkoutPage.enterEmail(testUser.email);
  await checkoutPage.fillBillingAddress(shippingAddress);
  await checkoutPage.continueToNextStep();
  
  const deliveryPage = new DeliveryPage(page);
  await deliveryPage.verifyDeliveryShippingDetails(testUser.email, shippingAddress);
  
  await deliveryPage.selectShippingMethod(TestData.shipping.standard);
  await deliveryPage.verifyShippingCost(TestData.products.tshirt.name, TestData.constants.ShippingCost.upsGround);   
  await deliveryPage.selectShippingMethod(TestData.shipping.express);
  await deliveryPage.verifyShippingCost(TestData.products.tshirt.name, TestData.constants.ShippingCost.upsTwoDay);
  await deliveryPage.selectShippingMethod(TestData.shipping.oneDay);
  await deliveryPage.verifyShippingCost(TestData.products.tshirt.name, TestData.constants.ShippingCost.upsOneDay);
  
  const paymentPage = await deliveryPage.continueToPayment();
  
  // Capture order token from URL
  const currentUrl = page.url();
  const tokenMatch = currentUrl.match(/\/checkout\/([^\/]+)/);
  const orderToken = tokenMatch ? tokenMatch[1] : '';
  
  // Set up API mocks for payment and confirmation
  await ApiMocks.mockOrderConfirmation(
    page,
    orderToken,
    shippingAddress.firstName,
    TestData.products.tshirt.name,
    TestData.products.tshirt.price
  );
  
  await paymentPage.selectCreditCardPayment();
  await paymentPage.fillCreditCardInfo({  
    nameOnCard: TestData.payment.validCard.cardholderName, 
    cardNumber: TestData.payment.validCard.cardNumber, 
    expirationDate: TestData.payment.validCard.expiryDate,  
    cvv: TestData.payment.validCard.cvv      
  });
  
  await paymentPage.placeOrder();
  
  // Force navigation to complete page
  await page.goto(`http://localhost:3000/checkout/${orderToken}/complete`);
  await page.waitForTimeout(1000);
  
  await paymentPage.verifyOrderSuccess(shippingAddress.firstName); 
});