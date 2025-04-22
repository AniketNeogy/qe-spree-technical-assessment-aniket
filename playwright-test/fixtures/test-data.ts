import { constants } from 'buffer';
import { Helpers } from '../utils/helpers';
import { faker } from '@faker-js/faker';

/**
 * Generate a dynamic user with unique email and password
 */
const generateTestUser = () => {
  return {
    email: faker.internet.email(),
    password: faker.internet.password({ length: 12 }),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  };
};

/**
 * Generate realistic address data
 */
const generateAddress = () => {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    address1: faker.location.streetAddress(),
    city: faker.location.city(),
    zipcode: faker.location.zipCode(),
    phone: faker.phone.number(),
    state: faker.location.state(),
    country: 'United States'
  };
};

/**
 * Generate payment information
 */
const generatePaymentInfo = () => {
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 3);  // Card expires 3 years in future
  
  return {
    validCard: {
      cardholderName: faker.person.fullName(),
      cardNumber: '5500000000000004', // Test card number that always succeeds
      expiryDate: "112029",
      cvv: "123"
    },
    declinedCard: {
      cardholderName: faker.person.fullName(),
      cardNumber: '4000000000000002', // Test card that will be declined
      expiryDate: "072031",
      cvv: "121"
    }
  };
};

/**
 * Test data for Spree Commerce tests
 */
export const TestData = {
  // User information
  users: {
    admin: {
      email: 'spree@example.com',
      password: 'spree123'
    },
    testUser: generateTestUser()
  },

  // Shipping and billing information
  address: generateAddress(),

  // Payment information
  payment: generatePaymentInfo(),

  // Sample product data
  products: {
    // These should be updated based on actual products in the store
    tshirt: {
      name: 'Denim Shirt',
      category: 'Clothing',
      price: 92.99
    },
    mug: {
      name: 'Checked Shirt',
      category: 'Clothing'
    },
    bag: {
      name: 'Running Sweatshirt',
      category: 'Sportswear'
    }
  },

  // Shipping options
  shipping: {
    standard: 'UPS Ground',
    express: 'UPS Two Day',
    oneDay: 'UPS One Day'
  },

  // Test coupon codes (if available)
  coupons: {
    valid: 'TESTCOUPON',
    expired: 'EXPIREDCOUPON',
    invalid: 'INVALIDCOUPON'
  },

  constants: {
    welcomeMessage : 'Welcome! You have signed up',
    shopAll: 'Shop All',
    ShippingCost: {
      upsGround: 'Shipping: $5.00',
      upsTwoDay: 'Shipping: $10.00',
      upsOneDay: 'Shipping: $15.00'
    },
    clothColor: {
      blue: 'Blue',
      red: 'Red',
      white: 'White',
      black: 'Black',
      green: 'Green',
    },
  
    clothSize: {
      small: 'S',
      medium: 'M',
      large: 'L',
      xlarge: 'XL'
    }
  },
}; 