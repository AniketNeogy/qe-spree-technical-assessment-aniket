import { test, expect, Page } from '@playwright/test';
import { HomePage } from '../page-objects/home-page';
import { CartPage } from '../page-objects/cart-page';
import { CheckoutPage } from '../page-objects/checkout-page';
import { DeliveryPage } from '../page-objects/delivery-page';
import { TestData } from '../fixtures/test-data';
import { ApiMocks } from '../api/api-mocks';
import { ApiClient } from '../api/api-client';

/**
 * E2E-03: Abandoned Cart Recovery
 * Tests that cart items persist across browser sessions and can be recovered
 */
test('E2E-03: Abandoned Cart Recovery', async ({ browser }) => {
  const testUser = TestData.users.testUser;
  const shippingAddress = TestData.address;
  
  let firstContext = await browser.newContext();
  let page = await firstContext.newPage();
  
  const homePage = new HomePage(page);
  await homePage.goto();

  await homePage.registerNewUser({
    email: testUser.email,
    password: testUser.password
  });
  await homePage.verifyWelcomeMessage(TestData.constants.welcomeMessage);
  
  const shopAllPage = await homePage.getShopAllPage();
  await shopAllPage.verifyShopAllPage(TestData.constants.shopAll);
  
  const firstProductPage = await shopAllPage.clickProductByName(TestData.products.tshirt.name);
  await firstProductPage.verifyProductName(TestData.products.tshirt.name);
  await firstProductPage.selectColor(TestData.constants.clothColor.blue);
  await firstProductPage.selectSize(TestData.constants.clothSize.large);
  
  const cartPage = await firstProductPage.addToCart();
  await cartPage.verifyProductNameAddedToCart(TestData.products.tshirt.name);
  await cartPage.checkCartItemsCount(1);
  const cartTotal = await cartPage.getCartTotal();
  
  // Close the first browser session
  await firstContext.close();
  
  // Second Session: Login again and verify cart persistence
  let secondContext = await browser.newContext();
  page = await secondContext.newPage();
  
  const newHomePage = new HomePage(page);
  await newHomePage.goto();
  await newHomePage.login({
    email: testUser.email,
    password: testUser.password
  });
  
  await newHomePage.goToCart();
  const newCartPage = new CartPage(page);
  
  await newCartPage.checkCartItemsCount(1);
  await newCartPage.verifyProductNameAddedToCart(TestData.products.tshirt.name);
  
  const newCartTotal = await newCartPage.getCartTotal();
  console.log(`Cart total after session restart: ${newCartTotal}`);
  expect(newCartTotal).toBe(cartTotal);
  
  await newCartPage.proceedToCheckout();
  const checkoutPage = new CheckoutPage(page);
  
  await checkoutPage.verifyEmailShown(testUser.email);
  await checkoutPage.fillBillingAddress(shippingAddress);
  await checkoutPage.continueToNextStep();
  
  const deliveryPage = new DeliveryPage(page);
  await deliveryPage.verifyDeliveryShippingDetails(testUser.email, shippingAddress);
  await deliveryPage.selectShippingMethod(TestData.shipping.standard);
  
  const paymentPage = await deliveryPage.continueToPayment();
  
  const currentUrl = page.url();
  const tokenMatch = currentUrl.match(/\/checkout\/([^\/]+)/);
  const orderToken = tokenMatch ? tokenMatch[1] : '';
  
  const tshirtPrice = TestData.products.tshirt.price
  
  await ApiMocks.mockOrderConfirmation(
    page,
    orderToken,
    shippingAddress.firstName,
    `${TestData.products.tshirt.name} and ${TestData.products.bag.name}`,
    tshirtPrice
  );
  
  await paymentPage.selectCreditCardPayment();
  await paymentPage.fillCreditCardInfo({  
    nameOnCard: TestData.payment.validCard.cardholderName, 
    cardNumber: TestData.payment.validCard.cardNumber, 
    expirationDate: TestData.payment.validCard.expiryDate,  
    cvv: TestData.payment.validCard.cvv      
  });
  
  await paymentPage.placeOrder();
  
  await page.goto(`http://localhost:3000/checkout/${orderToken}/complete`);
  await page.waitForTimeout(1000);
  await paymentPage.verifyOrderSuccess(shippingAddress.firstName);
}); 