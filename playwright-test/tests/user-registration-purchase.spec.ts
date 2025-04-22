import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/home-page';
import { CheckoutPage } from '../page-objects/checkout-page';
import { DeliveryPage } from '../page-objects/delivery-page';
import { TestData } from '../fixtures/test-data';

/**
 * E2E-01: User Registration and Purchase Flow (using check payment)
 */
test('E2E-01: New user registration and purchase flow', async ({ page }) => {
  const testUser = TestData.users.testUser;
  const shippingAddress = TestData.address;

  const homePage = new HomePage(page);
  await homePage.goto();
  
  await homePage.registerNewUser({
    email: testUser.email,
    password: testUser.password
  });
  await homePage.verifyWelcomeMessage(TestData.constants.welcomeMessage);
  
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
  
  await checkoutPage.verifyEmailShown(testUser.email);
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
  await paymentPage.selectCheckPayment();
  await paymentPage.placeOrder();
  await paymentPage.verifyOrderSuccess(shippingAddress.firstName); 
});