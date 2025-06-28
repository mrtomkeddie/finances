import { Transaction, Bank } from '../types/financial';
import { generateNextDueDate } from './dateUtils';

export const sampleTransactions: Transaction[] = [
  // HSBC Income
  {
    id: '1',
    type: 'income',
    title: 'Carers (Tom OSB)',
    amount: 81.90,
    frequency: 'weekly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-07', 'weekly', 2),
    description: 'Carers allowance for Tom'
  },
  {
    id: '2',
    type: 'income',
    title: 'Maximus Rent',
    amount: 150.00,
    frequency: 'weekly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-04', 'weekly', 5),
    description: 'Rental income from Maximus'
  },
  {
    id: '3',
    type: 'income',
    title: 'PIP (Lydia - 63D)',
    amount: 380.00,
    frequency: '4-weekly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-09', '4-weekly', 1),
    description: 'Personal Independence Payment for Lydia'
  },
  {
    id: '4',
    type: 'income',
    title: 'Universal Credit',
    amount: 1077.35,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-18', 'monthly', 8),
    description: 'Universal Credit payment'
  },
  // Barclays Income
  {
    id: '5',
    type: 'income',
    title: 'Carers (Lydia 63D)',
    amount: 81.90,
    frequency: 'weekly',
    bankId: 'barclays',
    date: generateNextDueDate('2025-04-07', 'weekly', 3),
    description: 'Carers allowance for Lydia'
  },
  {
    id: '6',
    type: 'income',
    title: 'Child Benefit',
    amount: 76.45,
    frequency: 'weekly',
    bankId: 'barclays',
    date: generateNextDueDate('2025-04-01', 'weekly', 6),
    description: 'Child benefit payment'
  },
  // HSBC Expenses (All 51 expense transactions)
  {
    id: '7',
    type: 'expense',
    title: 'Amazon Prime',
    amount: 95.00,
    frequency: 'yearly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-10-23', 'yearly'),
    description: 'Amazon Prime subscription'
  },
  {
    id: '8',
    type: 'expense',
    title: 'Apple One (Lydia)',
    amount: 36.95,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-19', 'monthly', 4),
    description: 'Apple One subscription'
  },
  {
    id: '9',
    type: 'expense',
    title: 'Apple Storage (Lydia)',
    amount: 8.99,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-17', 'monthly', 6),
    description: 'Apple iCloud storage'
  },
  {
    id: '10',
    type: 'expense',
    title: 'Apple Storage (Me)',
    amount: 26.99,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-14', 'monthly', 9),
    description: 'Apple iCloud storage'
  },
  {
    id: '11',
    type: 'expense',
    title: 'Aviva (includes RAC)',
    amount: 48.57,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-13', 'monthly', 10),
    description: 'Insurance payment'
  },
  {
    id: '12',
    type: 'expense',
    title: 'Bear Sweets',
    amount: 21.00,
    frequency: '4-weekly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-08', '4-weekly', 15),
    description: 'Sweet treats'
  },
  {
    id: '13',
    type: 'expense',
    title: 'CapCut',
    amount: 7.99,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-05-21', 'monthly', -8),
    description: 'CapCut subscription'
  },
  {
    id: '14',
    type: 'expense',
    title: 'Car Insurance',
    amount: 89.50,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-15', 'monthly', 8),
    description: 'Car insurance premium'
  },
  {
    id: '15',
    type: 'expense',
    title: 'Chat GPT (Lydia)',
    amount: 19.99,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-18', 'monthly', 5),
    description: 'ChatGPT subscription'
  },
  {
    id: '16',
    type: 'expense',
    title: 'Council Tax',
    amount: 167.63,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-01', 'monthly', 22),
    description: 'Monthly council tax payment'
  },
  {
    id: '17',
    type: 'expense',
    title: 'D&G/AO Appliance Care',
    amount: 49.87,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-28', 'monthly', -5),
    description: 'Appliance care plan'
  },
  {
    id: '18',
    type: 'expense',
    title: 'D&G/AO Care Plan',
    amount: 8.49,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-17', 'monthly', 6),
    description: 'Care plan'
  },
  {
    id: '19',
    type: 'expense',
    title: 'D&G/AO Care Plan',
    amount: 7.99,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-17', 'monthly', 6),
    description: 'Care plan'
  },
  {
    id: '20',
    type: 'expense',
    title: 'Disney Plus',
    amount: 129.90,
    frequency: 'yearly',
    bankId: 'hsbc',
    date: generateNextDueDate('2026-04-01', 'yearly'),
    description: 'Disney Plus subscription'
  },
  {
    id: '21',
    type: 'expense',
    title: 'Fat Jab',
    amount: 140.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-06-08', 'monthly', -25),
    description: 'Weight loss injection'
  },
  {
    id: '22',
    type: 'expense',
    title: 'Fennel',
    amount: 9.00,
    frequency: 'bi-weekly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-08', 'bi-weekly', 15),
    description: 'Fennel subscription'
  },
  {
    id: '23',
    type: 'expense',
    title: 'Food Shopping',
    amount: 250.00,
    frequency: 'weekly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-05', 'weekly', 1),
    description: 'Weekly grocery shopping'
  },
  {
    id: '24',
    type: 'expense',
    title: 'Gas Bill',
    amount: 112.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-25', 'monthly', -2),
    description: 'Gas heating bill'
  },
  {
    id: '25',
    type: 'expense',
    title: 'H3G',
    amount: 24.02,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-25', 'monthly', -2),
    description: 'Mobile phone contract'
  },
  {
    id: '26',
    type: 'expense',
    title: 'Hive',
    amount: 2.99,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-24', 'monthly', -1),
    description: 'Hive subscription'
  },
  {
    id: '27',
    type: 'expense',
    title: 'HSBC Loan',
    amount: 0.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-01', 'monthly', 22),
    description: 'HSBC loan payment'
  },
  {
    id: '28',
    type: 'expense',
    title: 'ID Mobile',
    amount: 7.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-12', 'monthly', 11),
    description: 'Mobile phone contract'
  },
  {
    id: '29',
    type: 'expense',
    title: 'Insurance (Home)',
    amount: 35.20,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-10', 'monthly', 13),
    description: 'Home insurance premium'
  },
  {
    id: '30',
    type: 'expense',
    title: 'Ionos (NovEd Email)',
    amount: 1.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-27', 'monthly', -4),
    description: 'Email hosting service'
  },
  {
    id: '31',
    type: 'expense',
    title: 'Magnesium',
    amount: 10.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-07', 'monthly', 16),
    description: 'Magnesium supplements'
  },
  {
    id: '32',
    type: 'expense',
    title: 'Mobile Insurance',
    amount: 12.99,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-14', 'monthly', 9),
    description: 'Mobile phone insurance'
  },
  {
    id: '33',
    type: 'expense',
    title: 'Mortgage',
    amount: 650.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-01', 'monthly', 22),
    description: 'Monthly mortgage payment'
  },
  {
    id: '34',
    type: 'expense',
    title: 'Netflix',
    amount: 15.99,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-22', 'monthly', 1),
    description: 'Netflix subscription'
  },
  {
    id: '35',
    type: 'expense',
    title: 'Nintendo Online',
    amount: 59.99,
    frequency: 'yearly',
    bankId: 'hsbc',
    date: generateNextDueDate('2026-01-22', 'yearly'),
    description: 'Nintendo Online subscription'
  },
  {
    id: '36',
    type: 'expense',
    title: 'O2',
    amount: 62.47,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-17', 'monthly', 6),
    description: 'O2 mobile contract'
  },
  {
    id: '37',
    type: 'expense',
    title: 'O2',
    amount: 19.13,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-17', 'monthly', 6),
    description: 'O2 mobile contract'
  },
  {
    id: '38',
    type: 'expense',
    title: 'Pet Food',
    amount: 25.00,
    frequency: 'bi-weekly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-08', 'bi-weekly', 15),
    description: 'Pet food and supplies'
  },
  {
    id: '39',
    type: 'expense',
    title: 'Petrol',
    amount: 30.00,
    frequency: 'weekly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-07', 'weekly', 2),
    description: 'Petrol costs'
  },
  {
    id: '40',
    type: 'expense',
    title: 'Playstation Network',
    amount: 13.49,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-26', 'monthly', -3),
    description: 'PlayStation subscription'
  },
  {
    id: '41',
    type: 'expense',
    title: 'Pobl/Rent Topup',
    amount: 40.00,
    frequency: '4-weekly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-09', '4-weekly', 14),
    description: 'Rent top-up payment'
  },
  {
    id: '42',
    type: 'expense',
    title: 'Ring',
    amount: 7.99,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-17', 'monthly', 6),
    description: 'Ring security subscription'
  },
  {
    id: '43',
    type: 'expense',
    title: 'Roblox (Charlie)',
    amount: 9.99,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-03', 'monthly', 20),
    description: 'Roblox subscription'
  },
  {
    id: '44',
    type: 'expense',
    title: 'Scottish Power',
    amount: 245.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-20', 'monthly', 3),
    description: 'Electricity bill'
  },
  {
    id: '45',
    type: 'expense',
    title: 'Sky Digital',
    amount: 78.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-19', 'monthly', 4),
    description: 'Sky TV subscription'
  },
  {
    id: '46',
    type: 'expense',
    title: 'Sky Mobile',
    amount: 45.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-05', 'monthly', 18),
    description: 'Sky Mobile contract'
  },
  {
    id: '47',
    type: 'expense',
    title: 'Spotify',
    amount: 9.99,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-23', 'monthly', 0),
    description: 'Spotify Premium subscription'
  },
  {
    id: '48',
    type: 'expense',
    title: 'Tesco Delivery',
    amount: 6.99,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-26', 'monthly', -3),
    description: 'Tesco delivery service'
  },
  {
    id: '49',
    type: 'expense',
    title: 'TV License',
    amount: 13.25,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-15', 'monthly', 8),
    description: 'TV License fee'
  },
  {
    id: '50',
    type: 'expense',
    title: 'Utilities (Water)',
    amount: 45.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-18', 'monthly', 5),
    description: 'Water utility bill'
  },
  {
    id: '51',
    type: 'expense',
    title: 'Virgin Pure',
    amount: 33.24,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-03', 'monthly', 20),
    description: 'Water filter system'
  },
  {
    id: '52',
    type: 'expense',
    title: 'Vitamins',
    amount: 45.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-19', 'monthly', 4),
    description: 'Vitamin supplements'
  },
  {
    id: '53',
    type: 'expense',
    title: 'Welsh Water',
    amount: 13.77,
    frequency: 'weekly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-07', 'weekly', 2),
    description: 'Water bill'
  },
  {
    id: '54',
    type: 'expense',
    title: 'Wipes',
    amount: 13.00,
    frequency: 'bi-weekly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-08', 'bi-weekly', 15),
    description: 'Baby wipes'
  },
  {
    id: '55',
    type: 'expense',
    title: 'WWT',
    amount: 9.75,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-17', 'monthly', 6),
    description: 'WWT subscription'
  },
  {
    id: '56',
    type: 'expense',
    title: 'Youfibre',
    amount: 32.99,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-21', 'monthly', 2),
    description: 'Internet service'
  },
  {
    id: '57',
    type: 'expense',
    title: 'Vitamins (Extra)',
    amount: 15.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-12', 'monthly', 11),
    description: 'Additional vitamin supplements'
  },
  // Santander Expenses (7 transactions from the image)
  {
    id: '58',
    type: 'expense',
    title: 'Canva',
    amount: 10.99,
    frequency: 'monthly',
    bankId: 'santander',
    date: generateNextDueDate('2025-04-05', 'monthly', 18),
    description: 'Canva design subscription'
  },
  {
    id: '59',
    type: 'expense',
    title: 'Card',
    amount: 15.00,
    frequency: 'yearly',
    bankId: 'santander',
    date: generateNextDueDate('2026-03-30', 'yearly'),
    description: 'Annual card fee'
  },
  {
    id: '60',
    type: 'expense',
    title: 'Chat GPT (Tom)',
    amount: 19.99,
    frequency: 'monthly',
    bankId: 'santander',
    date: generateNextDueDate('2025-04-18', 'monthly', 5),
    description: 'ChatGPT subscription for Tom'
  },
  {
    id: '61',
    type: 'expense',
    title: 'Figma',
    amount: 17.00,
    frequency: 'monthly',
    bankId: 'santander',
    date: generateNextDueDate('2025-07-30', 'monthly', -107),
    description: 'Figma design subscription'
  },
  {
    id: '62',
    type: 'expense',
    title: 'Google One (w/Gemini)',
    amount: 19.99,
    frequency: 'monthly',
    bankId: 'santander',
    date: generateNextDueDate('2025-04-26', 'monthly', -3),
    description: 'Google One with Gemini subscription'
  },
  {
    id: '63',
    type: 'expense',
    title: 'Ionos (NovaEdAI.com)',
    amount: 15.00,
    frequency: 'yearly',
    bankId: 'santander',
    date: generateNextDueDate('2026-03-27', 'yearly'),
    description: 'Domain and hosting for NovaEdAI.com'
  },
  {
    id: '64',
    type: 'expense',
    title: 'Lewis Mocker',
    amount: 46.92,
    frequency: 'monthly',
    bankId: 'santander',
    date: generateNextDueDate('2025-04-07', 'monthly', 16),
    description: 'Lewis Mocker service'
  },
  // HSBC and other Debt Payments (updated with image data)
  {
    id: '65',
    type: 'debt',
    title: 'Avantis (Argos)',
    amount: 5.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-13', 'monthly', 10),
    description: 'Argos credit card',
    remainingBalance: 3929.14
  },
  {
    id: '66',
    type: 'debt',
    title: 'B/Card Forward',
    amount: 40.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-15', 'monthly', 8),
    description: 'Barclaycard payment',
    remainingBalance: 678.76
  },
  {
    id: '67',
    type: 'debt',
    title: 'Creation (PC World)',
    amount: 113.20,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-28', 'monthly', -5),
    description: 'PC World credit',
    remainingBalance: 1460.44
  },
  {
    id: '68',
    type: 'debt',
    title: 'Freemans',
    amount: 50.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-24', 'monthly', -1),
    description: 'Freemans catalogue',
    remainingBalance: 310.00
  },
  {
    id: '69',
    type: 'debt',
    title: 'HSBC Credit Card',
    amount: 31.63,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-21', 'monthly', 2),
    description: 'HSBC credit card payment',
    remainingBalance: 733.48
  },
  {
    id: '70',
    type: 'debt',
    title: 'HSBC Overdraft',
    amount: 0.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-01', 'monthly', 22),
    description: 'HSBC overdraft fee',
    remainingBalance: 1500.00
  },
  {
    id: '71',
    type: 'debt',
    title: 'Lowell (Studio)',
    amount: 2.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-05-19', 'monthly', -26),
    description: 'Studio debt payment',
    remainingBalance: 1353.39
  },
  {
    id: '72',
    type: 'debt',
    title: 'Moorcroft (Next)',
    amount: 5.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-17', 'monthly', 6),
    description: 'Next debt payment',
    remainingBalance: 5431.12
  },
  {
    id: '73',
    type: 'debt',
    title: 'Newday (AO)',
    amount: 149.60,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-21', 'monthly', 2),
    description: 'AO credit payment',
    remainingBalance: 2922.97
  },
  {
    id: '74',
    type: 'debt',
    title: 'Paypal',
    amount: 70.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-14', 'monthly', 9),
    description: 'PayPal debt payments',
    remainingBalance: 1325.48
  },
  {
    id: '75',
    type: 'debt',
    title: 'Very',
    amount: 2.00,
    frequency: 'monthly',
    bankId: 'hsbc',
    date: generateNextDueDate('2025-04-17', 'monthly', 6),
    description: 'Very account debt payment',
    remainingBalance: 1260.58
  }
];

export const sampleBanks: Bank[] = [
  { id: 'all-income', name: 'All Income', color: '#10b981', type: 'bank' },
  { id: 'all-expenses', name: 'All Expenses', color: '#ef4444', type: 'bank' },
  { id: 'all-debt', name: 'All Debt', color: '#f59e0b', type: 'bank' },
  { id: 'hsbc', name: 'HSBC', color: '#dc2626', type: 'bank' },
  { id: 'barclays', name: 'Barclays', color: '#2563eb', type: 'bank' },
  { id: 'santander', name: 'Santander', color: '#6b7280', type: 'bank' },
];