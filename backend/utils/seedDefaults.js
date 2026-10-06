const Category = require('../models/Category');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');

const DEFAULT_CATEGORIES = [
  // Expense categories
  { name: 'Food & Dining', type: 'expense', icon: 'utensils', color: '#ef4444', isDefault: true },
  { name: 'Groceries', type: 'expense', icon: 'shopping-cart', color: '#f97316', isDefault: true },
  { name: 'Housing & Rent', type: 'expense', icon: 'home', color: '#8b5cf6', isDefault: true },
  { name: 'Utilities & Bills', type: 'expense', icon: 'zap', color: '#06b6d4', isDefault: true },
  { name: 'Transportation', type: 'expense', icon: 'car', color: '#3b82f6', isDefault: true },
  { name: 'Entertainment', type: 'expense', icon: 'film', color: '#ec4899', isDefault: true },
  { name: 'Healthcare', type: 'expense', icon: 'activity', color: '#10b981', isDefault: true },
  { name: 'Shopping & Apparel', type: 'expense', icon: 'shopping-bag', color: '#d946ef', isDefault: true },
  { name: 'Education', type: 'expense', icon: 'book-open', color: '#6366f1', isDefault: true },
  { name: 'Travel & Vacations', type: 'expense', icon: 'plane', color: '#14b8a6', isDefault: true },
  { name: 'Personal Care', type: 'expense', icon: 'smile', color: '#f43f5e', isDefault: true },
  { name: 'Investments & Savings', type: 'expense', icon: 'trending-up', color: '#84cc16', isDefault: true },
  { name: 'Miscellaneous', type: 'expense', icon: 'more-horizontal', color: '#64748b', isDefault: true },

  // Income categories
  { name: 'Salary & Wages', type: 'income', icon: 'briefcase', color: '#10b981', isDefault: true },
  { name: 'Freelance & Contracting', type: 'income', icon: 'laptop', color: '#06b6d4', isDefault: true },
  { name: 'Business Revenue', type: 'income', icon: 'pie-chart', color: '#6366f1', isDefault: true },
  { name: 'Investment Returns & Dividends', type: 'income', icon: 'dollar-sign', color: '#84cc16', isDefault: true },
  { name: 'Rental Income', type: 'income', icon: 'key', color: '#eab308', isDefault: true },
  { name: 'Gifts & Grants', type: 'income', icon: 'gift', color: '#ec4899', isDefault: true },
  { name: 'Other Income', type: 'income', icon: 'plus-circle', color: '#14b8a6', isDefault: true }
];

const seedDefaultData = async () => {
  try {
    // 1. Seed Categories if none exist
    let categories = await Category.find({ isDefault: true });
    if (categories.length === 0) {
      categories = await Category.insertMany(DEFAULT_CATEGORIES);
      console.log('✅ Default system categories seeded successfully');
    }

    // 2. Seed Demo Admin User if not exists
    const demoEmail = 'admin@finpulse.io';
    let demoUser = await User.findOne({ email: demoEmail });

    if (!demoUser) {
      demoUser = await User.create({
        name: 'Demo Administrator',
        email: demoEmail,
        password: 'admin123456',
        role: 'admin',
        currency: 'USD'
      });
      console.log(`✅ Demo admin user created (${demoEmail} / admin123456)`);

      // 3. Seed starter transactions, budgets and goals for demo user
      const foodCat = categories.find((c) => c.name === 'Food & Dining') || categories[0];
      const salaryCat = categories.find((c) => c.name === 'Salary & Wages') || categories[categories.length - 1];
      const rentCat = categories.find((c) => c.name === 'Housing & Rent') || categories[1];
      const utilCat = categories.find((c) => c.name === 'Utilities & Bills') || categories[2];

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // Transactions
      await Transaction.create([
        {
          user: demoUser._id,
          title: 'Monthly Engineering Salary',
          type: 'income',
          amount: 5200.00,
          category: salaryCat._id,
          date: new Date(currentYear, currentMonth - 1, 1),
          paymentMethod: 'bank_transfer',
          notes: 'Direct deposit payroll'
        },
        {
          user: demoUser._id,
          title: 'Apartment Monthly Rent',
          type: 'expense',
          amount: 1400.00,
          category: rentCat._id,
          date: new Date(currentYear, currentMonth - 1, 2),
          paymentMethod: 'bank_transfer',
          notes: 'Downtown apartment lease'
        },
        {
          user: demoUser._id,
          title: 'Weekly Gourmet Groceries',
          type: 'expense',
          amount: 215.50,
          category: foodCat._id,
          date: new Date(currentYear, currentMonth - 1, 4),
          paymentMethod: 'credit_card',
          notes: 'Whole Foods Market'
        },
        {
          user: demoUser._id,
          title: 'High-speed Internet & Power',
          type: 'expense',
          amount: 145.00,
          category: utilCat._id,
          date: new Date(currentYear, currentMonth - 1, 5),
          paymentMethod: 'credit_card',
          notes: 'Fiber broadband and electricity'
        }
      ]);

      // Budget
      await Budget.create({
        user: demoUser._id,
        category: foodCat._id,
        amount: 600,
        month: currentMonth,
        year: currentYear,
        alertThreshold: 80
      });

      // Goal
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + 6);

      await Goal.create({
        user: demoUser._id,
        title: 'Emergency Rainy Day Fund',
        targetAmount: 10000,
        currentAmount: 3450,
        targetDate,
        category: 'Emergency Fund',
        color: '#10b981',
        notes: '6 months of living expenses reserve'
      });

      console.log('✅ Demo financial data populated');
    }
  } catch (err) {
    console.error('Error seeding data:', err.message);
  }
};

module.exports = { seedDefaultData, seedDefaultCategories: seedDefaultData, DEFAULT_CATEGORIES };
