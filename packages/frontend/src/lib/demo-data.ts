// Demo data to be inserted for new demo users
export const demo_categories = [
  { name: "Fruits & Vegetables" },
  { name: "Meat & Fish" },
  { name: "Beverages" },
  { name: "Snacks" },
  { name: "Dry Goods" },
] as const;

export const demo_items = [
  {
    name: "Bananas",
    description: null,
    image_url:
      "https://images.pexels.com/photos/108059/pexels-photo-108059.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category_name: "Fruits & Vegetables",
  },
  {
    name: "Apples",
    description: "Honeycrisp",
    image_url:
      "https://images.pexels.com/photos/2487443/pexels-photo-2487443.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    category_name: "Fruits & Vegetables",
  },
  {
    name: "Blueberries",
    description: null,
    image_url:
      "https://images.pexels.com/photos/2539177/pexels-photo-2539177.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category_name: "Fruits & Vegetables",
  },
  {
    name: "Spring mix",
    description: "Needs radicchio and tango",
    image_url:
      "https://images.pexels.com/photos/18302703/pexels-photo-18302703/free-photo-of-a-salad-in-a-bowl-on-the-table.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category_name: "Fruits & Vegetables",
  },
  {
    name: "Chicken Thighs",
    description: null,
    image_url: null,
    category_name: "Meat & Fish",
  },
  {
    name: "Salmon",
    description: "Fresh Atlantic salmon",
    image_url: null,
    category_name: "Meat & Fish",
  },
  {
    name: "Whole turkey",
    description: null,
    image_url: null,
    category_name: "Meat & Fish",
  },
  {
    name: "Coffee",
    description: null,
    image_url:
      "https://images.pexels.com/photos/30649432/pexels-photo-30649432/free-photo-of-top-view-of-freshly-roasted-coffee-beans.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category_name: "Beverages",
  },
  {
    name: "Arnold Palmer",
    description: null,
    image_url: null,
    category_name: "Beverages",
  },
  {
    name: "Hot Cheetos",
    description: null,
    image_url: null,
    category_name: "Snacks",
  },
  {
    name: "Mixed Nuts",
    description: null,
    image_url:
      "https://images.pexels.com/photos/86649/pexels-photo-86649.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category_name: "Snacks",
  },
  {
    name: "Raisins",
    description: null,
    image_url:
      "https://images.pexels.com/photos/6086004/pexels-photo-6086004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category_name: "Snacks",
  },
  {
    name: "Cornbread mix",
    description: "Famous Dave's",
    image_url: null,
    category_name: "Dry Goods",
  },
  {
    name: "Cheerios",
    description: null,
    image_url: null,
    category_name: "Snacks",
  },
] as const;

export const demo_lists = [
  {
    name: "Weekly groceries",
    completed: false,
    created_at: "2025-02-10T00:00:00.000Z",
    updated_at: "2025-02-15T00:00:00.000Z",
    items: ["Bananas", "Chicken Thighs", "Coffee", "Mixed Nuts"],
  },
  {
    name: "Party supplies",
    completed: false,
    created_at: "2025-01-01T00:00:00.000Z",
    updated_at: "2025-01-01T00:00:00.000Z",
    items: ["Hot Cheetos", "Mixed Nuts", "Arnold Palmer"],
  },
  {
    name: "Groceries",
    completed: true,
    created_at: "2024-12-27T00:00:00.000Z",
    updated_at: "2024-12-27T00:00:00.000Z",
    items: ["Cheerios", "Coffee", "Blueberries"],
  },
  {
    name: "Xmas dinner",
    completed: true,
    created_at: "2024-12-15T00:00:00.000Z",
    updated_at: "2024-12-15T00:00:00.000Z",
    items: ["Whole turkey", "Mixed Nuts", "Cornbread mix"],
  },
  {
    name: "Potluck stuff",
    completed: true,
    created_at: "2024-11-11T00:00:00.000Z",
    updated_at: "2024-11-11T00:00:00.000Z",
    items: ["Salmon", "Apples", "Arnold Palmer"],
  },
] as const;
