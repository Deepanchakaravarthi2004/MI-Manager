
import { Product, UserRole, UserProfile } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'On&On 9e5 Premium Health Drink',
    image: 'https://picsum.photos/seed/health1/400/400',
    distributorPrice: 1800,
    retailPrice: 2450,
    category: 'Health Care',
    status: 'Active',
    stock: 25
  },
  {
    id: '2',
    name: 'Elements Wellness Aloe Vera Juice',
    image: 'https://picsum.photos/seed/aloe/400/400',
    distributorPrice: 850,
    retailPrice: 1050,
    category: 'Ayurvedic',
    status: 'Active',
    stock: 15
  },
  {
    id: '3',
    name: 'On&On Nutrilife Vanilla',
    image: 'https://picsum.photos/seed/nutrition/400/400',
    distributorPrice: 1200,
    retailPrice: 1600,
    category: 'Nutrition',
    status: 'Active',
    stock: 10
  },
  {
    id: '4',
    name: 'Elements Wellness Multipurpose Cream',
    image: 'https://picsum.photos/seed/cream/400/400',
    distributorPrice: 150,
    retailPrice: 220,
    category: 'Personal Care',
    status: 'Active',
    stock: 45
  }
];

export const ADMIN_SAMPLE = {
  mobile: 'admin',
  password: 'admin123'
};

export const USER_SAMPLE = {
  mobile: 'user',
  password: 'user123'
};

export const CATEGORIES = [
  'Health Care',
  'Personal Care',
  'Ayurvedic',
  'Nutrition',
  'Home Care',
  'Agriculture'
];
