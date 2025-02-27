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
    image_url: null,
    category_name: "Fruits & Vegetables",
  },
  {
    name: "Apples",
    description: "Honeycrisp",
    image_url: null,
    category_name: "Fruits & Vegetables",
  },
  {
    name: "Blueberries",
    description: null,
    image_url: null,
    category_name: "Fruits & Vegetables",
  },
  {
    name: "Spring mix",
    description: "Needs radicchio and tango",
    image_url: null,
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
    description: "Ground Colombian",
    image_url: null,
    category_name: "Beverages",
  },
  {
    name: "Arnold Palmer jug",
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
    image_url: null,
    category_name: "Snacks",
  },
  {
    name: "Raisins",
    description: null,
    image_url: null,
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
    created_at: "2025-02-10T00:00:00.000Z",
    updated_at: "2025-02-15T00:00:00.000Z",
    items: ["Bananas", "Chicken Thighs", "Coffee", "Mixed Nuts"],
  },
  {
    name: "Party supplies",
    created_at: "2025-01-01T00:00:00.000Z",
    updated_at: "2025-01-01T00:00:00.000Z",
    items: ["Hot Cheetos", "Mixed Nuts", "Arnold Palmer jug"],
  },
  {
    name: "Groceries",
    created_at: "2024-12-27T00:00:00.000Z",
    updated_at: "2024-12-27T00:00:00.000Z",
    items: ["Cheerios", "Coffee", "Blueberries"],
  },
  {
    name: "Xmas dinner",
    created_at: "2024-12-15T00:00:00.000Z",
    updated_at: "2024-12-15T00:00:00.000Z",
    items: ["Whole turkey", "Mixed Nuts", "Cornbread mix"],
  },
  {
    name: "Potluck stuff",
    created_at: "2024-11-11T00:00:00.000Z",
    updated_at: "2024-11-11T00:00:00.000Z",
    items: ["Salmon", "Apples", "Arnold Palmer jug"],
  },
] as const;
