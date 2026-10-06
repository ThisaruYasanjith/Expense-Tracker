const Category = require('../models/Category');

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

const seedDefaultCategories = async () => {
  try {
    const count = await Category.countDocuments({ isDefault: true });
    if (count === 0) {
      await Category.insertMany(DEFAULT_CATEGORIES);
      console.log('✅ Default system categories seeded successfully');
    }
  } catch (err) {
    console.error('Error seeding categories:', err.message);
  }
};

module.exports = { seedDefaultCategories, DEFAULT_CATEGORIES };
