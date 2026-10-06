import { db } from "@/db";
import { users, categories, products, deliverySlots } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { sql } from "drizzle-orm";

export const sampleCategories = [
  {
    name: "Fruits & Vegetables",
    slug: "fruits-vegetables",
    description: "Farm-fresh organic fruits, leafy greens, root veggies & seasonal picks",
    icon: "Apple",
    color: "#059669" // emerald
  },
  {
    name: "Dairy & Eggs",
    slug: "dairy-eggs",
    description: "Pure farm milk, artisanal cheeses, cultured yogurt & free-range eggs",
    icon: "Milk",
    color: "#D97706" // amber/gold
  },
  {
    name: "Bakery",
    slug: "bakery",
    description: "Freshly baked sourdough, whole grain breads, croissants & pastries",
    icon: "Croissant",
    color: "#B45309" // warm tan/amber
  },
  {
    name: "Meat & Seafood",
    slug: "meat-seafood",
    description: "Prime cuts, organic poultry, wild-caught salmon & fresh seafood",
    icon: "Beef",
    color: "#DC2626" // warm soft red
  },
  {
    name: "Pantry Staples",
    slug: "pantry-staples",
    description: "Extra virgin olive oil, fragrant grains, pasta, pulses & spices",
    icon: "Package",
    color: "#4B5563" // earthy slate
  },
  {
    name: "Beverages",
    slug: "beverages",
    description: "Cold-pressed juices, organic kombucha, artisanal roast coffee & teas",
    icon: "Coffee",
    color: "#0D9488" // teal/emerald
  },
  {
    name: "Snacks",
    slug: "snacks",
    description: "Nutrient-dense nut mixes, dried fruits, organic dark chocolate & crisps",
    icon: "Cookie",
    color: "#EA580C" // burnt orange
  }
];

export const sampleProducts = [
  // Fruits & Vegetables (slug: fruits-vegetables)
  {
    name: "Organic Hass Avocados",
    categorySlug: "fruits-vegetables",
    price: "4.99",
    unit: "4 pack",
    stockQuantity: 45,
    lowStockThreshold: 10,
    description: "Creamy, perfectly ripe organic Hass avocados, rich in healthy fats and potassium.",
    imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80",
    badge: "Organic",
    isFeatured: true
  },
  {
    name: "Crisp Honeycrisp Apples",
    categorySlug: "fruits-vegetables",
    price: "3.49",
    unit: "per kg",
    stockQuantity: 60,
    lowStockThreshold: 12,
    description: "Sweet, exceptionally juicy and crisp apples harvested at peak ripeness.",
    imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80",
    badge: "Fresh Pick",
    isFeatured: true
  },
  {
    name: "Baby Spinach Leaves",
    categorySlug: "fruits-vegetables",
    price: "2.89",
    unit: "250g pack",
    stockQuantity: 30,
    lowStockThreshold: 8,
    description: "Tender, pre-washed baby spinach leaves ideal for quick salads, smoothies, or sautéing.",
    imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80",
    badge: "Organic",
    isFeatured: false
  },
  {
    name: "Vine-Ripened Cherry Tomatoes",
    categorySlug: "fruits-vegetables",
    price: "3.29",
    unit: "400g tub",
    stockQuantity: 25,
    lowStockThreshold: 8,
    description: "Bursting with sweetness, grown naturally on vine clusters for intense garden flavor.",
    imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
    badge: "Fresh Pick",
    isFeatured: false
  },
  {
    name: "Organic English Cucumbers",
    categorySlug: "fruits-vegetables",
    price: "1.99",
    unit: "each",
    stockQuantity: 40,
    lowStockThreshold: 10,
    description: "Crisp, thin-skinned and seedless organic cucumbers with refreshing crunch.",
    imageUrl: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=600&q=80",
    badge: null,
    isFeatured: false
  },

  // Dairy & Eggs (slug: dairy-eggs)
  {
    name: "Farm Fresh Whole Milk",
    categorySlug: "dairy-eggs",
    price: "3.99",
    unit: "1 Gallon",
    stockQuantity: 35,
    lowStockThreshold: 10,
    description: "Grade A pasture-raised whole milk, gently pasteurized to preserve natural richness.",
    imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
    badge: "Pasture Raised",
    isFeatured: true
  },
  {
    name: "Organic Pasture-Raised Brown Eggs",
    categorySlug: "dairy-eggs",
    price: "5.49",
    unit: "per dozen",
    stockQuantity: 50,
    lowStockThreshold: 15,
    description: "Eggs with rich golden-amber yolks from hens with year-round outdoor pasture access.",
    imageUrl: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80",
    badge: "Bestseller",
    isFeatured: true
  },
  {
    name: "Greek Whole Milk Yogurt",
    categorySlug: "dairy-eggs",
    price: "4.79",
    unit: "907g tub",
    stockQuantity: 28,
    lowStockThreshold: 8,
    description: "Authentic strained Greek whole milk yogurt with thick texture and 18g protein per serving.",
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80",
    badge: "Probiotic",
    isFeatured: false
  },
  {
    name: "Aged Sharp Cheddar Block",
    categorySlug: "dairy-eggs",
    price: "6.29",
    unit: "250g block",
    stockQuantity: 20,
    lowStockThreshold: 5,
    description: "Slow-aged for 18 months, deliver rich nutty bite and crumbly savory crystal texture.",
    imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=600&q=80",
    badge: "Artisanal",
    isFeatured: false
  },
  {
    name: "Sweet Cream Salted Butter",
    categorySlug: "dairy-eggs",
    price: "4.49",
    unit: "454g (4 sticks)",
    stockQuantity: 32,
    lowStockThreshold: 10,
    description: "Slow-churned butter made from pure fresh cream with sea salt flakes.",
    imageUrl: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80",
    badge: null,
    isFeatured: false
  },

  // Bakery (slug: bakery)
  {
    name: "Artisan Sourdough Boule",
    categorySlug: "bakery",
    price: "5.99",
    unit: "700g loaf",
    stockQuantity: 18,
    lowStockThreshold: 5,
    description: "Wild yeast sourdough naturally fermented for 36 hours for blistered crust and airy crumb.",
    imageUrl: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80",
    badge: "Fresh Baked Daily",
    isFeatured: true
  },
  {
    name: "All-Butter French Croissants",
    categorySlug: "bakery",
    price: "4.99",
    unit: "4 pack",
    stockQuantity: 22,
    lowStockThreshold: 6,
    description: "Flaky, multi-layered French croissants baked with Normandy butter until deep golden.",
    imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
    badge: "Fresh Pick",
    isFeatured: false
  },
  {
    name: "Multi-Seed Ancient Grain Bread",
    categorySlug: "bakery",
    price: "4.89",
    unit: "600g loaf",
    stockQuantity: 25,
    lowStockThreshold: 7,
    description: "Loaded with toasted flax, chia, pumpkin and sunflower seeds for sustained energy.",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    badge: null,
    isFeatured: false
  },
  {
    name: "New York Style Plain Bagels",
    categorySlug: "bakery",
    price: "3.99",
    unit: "6 pack",
    stockQuantity: 30,
    lowStockThreshold: 8,
    description: "Kettle-boiled and hearth-baked for authentic dense chew and glossy sheen.",
    imageUrl: "https://images.unsplash.com/photo-1585478259715-876acc5be8eb?auto=format&fit=crop&w=600&q=80",
    badge: null,
    isFeatured: false
  },

  // Meat & Seafood (slug: meat-seafood)
  {
    name: "Wild-Caught Alaskan Salmon Fillet",
    categorySlug: "meat-seafood",
    price: "12.99",
    unit: "450g fillet",
    stockQuantity: 15,
    lowStockThreshold: 5,
    description: "Sustainably sourced sockeye salmon fillet, packed with omega-3 fatty acids and deep coral color.",
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80",
    badge: "Wild Caught",
    isFeatured: true
  },
  {
    name: "Organic Boneless Chicken Breasts",
    categorySlug: "meat-seafood",
    price: "8.99",
    unit: "per kg",
    stockQuantity: 24,
    lowStockThreshold: 8,
    description: "Free-range air-chilled chicken breasts with zero antibiotics or added hormones.",
    imageUrl: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80",
    badge: "Organic",
    isFeatured: true
  },
  {
    name: "Grass-Fed Beef Ribeye Steak",
    categorySlug: "meat-seafood",
    price: "15.49",
    unit: "350g cut",
    stockQuantity: 14,
    lowStockThreshold: 4,
    description: "100% pasture-fed beef ribeye with delicate marbling for extraordinary tenderness and flavor.",
    imageUrl: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80",
    badge: "Grass Fed",
    isFeatured: false
  },
  {
    name: "Jumbo Raw Wild Gulf Shrimp",
    categorySlug: "meat-seafood",
    price: "11.29",
    unit: "500g bag",
    stockQuantity: 18,
    lowStockThreshold: 5,
    description: "Peeled and deveined wild gulf shrimp ready for grilling, pasta dishes or seafood boil.",
    imageUrl: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80",
    badge: null,
    isFeatured: false
  },

  // Pantry Staples (slug: pantry-staples)
  {
    name: "Cold-Pressed Extra Virgin Olive Oil",
    categorySlug: "pantry-staples",
    price: "11.99",
    unit: "750ml bottle",
    stockQuantity: 30,
    lowStockThreshold: 6,
    description: "First cold pressed from early-harvest Koroneiki olives with peppery finish and low acidity.",
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
    badge: "Estate Bottled",
    isFeatured: true
  },
  {
    name: "Organic Royal Quinoa",
    categorySlug: "pantry-staples",
    price: "4.99",
    unit: "500g pouch",
    stockQuantity: 40,
    lowStockThreshold: 10,
    description: "Complete plant protein grain pre-washed to remove saponin, light and fluffy texture.",
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    badge: "Organic",
    isFeatured: false
  },
  {
    name: "Bronze-Cut Italian Spaghetti",
    categorySlug: "pantry-staples",
    price: "2.79",
    unit: "500g pack",
    stockQuantity: 55,
    lowStockThreshold: 15,
    description: "Made with 100% durum semolina, extruded through bronze dies for rough sauce-gripping texture.",
    imageUrl: "https://images.unsplash.com/photo-1551462147-37885acc36f1?auto=format&fit=crop&w=600&q=80",
    badge: "Imported",
    isFeatured: false
  },
  {
    name: "Pure Raw Wildflower Honey",
    categorySlug: "pantry-staples",
    price: "7.49",
    unit: "450g jar",
    stockQuantity: 22,
    lowStockThreshold: 6,
    description: "Unfiltered and unheated pure honey retaining active pollen, enzymes, and delicate floral notes.",
    imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
    badge: "Raw & Pure",
    isFeatured: false
  },

  // Beverages (slug: beverages)
  {
    name: "Cold-Pressed Green Power Juice",
    categorySlug: "beverages",
    price: "4.29",
    unit: "350ml bottle",
    stockQuantity: 25,
    lowStockThreshold: 8,
    description: "Nutrient powerhouse blend of organic kale, crisp cucumber, celery, green apple and ginger.",
    imageUrl: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80",
    badge: "Fresh Pressed",
    isFeatured: true
  },
  {
    name: "Single-Origin Ethiopian Whole Bean Coffee",
    categorySlug: "beverages",
    price: "13.50",
    unit: "340g bag",
    stockQuantity: 20,
    lowStockThreshold: 5,
    description: "Medium roast specialty beans with floral jasmine aroma and bright notes of bergamot and stone fruit.",
    imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80",
    badge: "Direct Trade",
    isFeatured: false
  },
  {
    name: "Organic Ginger Lemon Kombucha",
    categorySlug: "beverages",
    price: "3.69",
    unit: "473ml glass bottle",
    stockQuantity: 34,
    lowStockThreshold: 10,
    description: "Naturally effervescent probiotic fermented tea with real pressed organic ginger and zesty lemon.",
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
    badge: "Probiotic",
    isFeatured: false
  },
  {
    name: "Sparkling Mineral Water (6 Pack)",
    categorySlug: "beverages",
    price: "5.29",
    unit: "6 x 330ml cans",
    stockQuantity: 40,
    lowStockThreshold: 10,
    description: "Crisp natural bubbling spring water with clean mineral profile and zero calories or sweeteners.",
    imageUrl: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80",
    badge: null,
    isFeatured: false
  },

  // Snacks (slug: snacks)
  {
    name: "Dry Roasted California Almonds",
    categorySlug: "snacks",
    price: "6.99",
    unit: "350g pack",
    stockQuantity: 35,
    lowStockThreshold: 8,
    description: "Slow oven-roasted almonds with a touch of coarse sea salt, high protein and fiber snack.",
    imageUrl: "https://images.unsplash.com/photo-1508061252966-f72fb402945d?auto=format&fit=crop&w=600&q=80",
    badge: "Heart Healthy",
    isFeatured: true
  },
  {
    name: "85% Dark Single-Origin Chocolate Bar",
    categorySlug: "snacks",
    price: "3.89",
    unit: "100g bar",
    stockQuantity: 42,
    lowStockThreshold: 10,
    description: "Intense, velvety fair-trade dark chocolate with rich fruity undertones and low sugar.",
    imageUrl: "https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=600&q=80",
    badge: "Fair Trade",
    isFeatured: false
  },
  {
    name: "Avocado Oil Kettle Cooked Chips",
    categorySlug: "snacks",
    price: "3.49",
    unit: "180g bag",
    stockQuantity: 28,
    lowStockThreshold: 8,
    description: "Thick cut potatoes gently batch-cooked in 100% pure avocado oil with Himalayan pink salt.",
    imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80",
    badge: "Gluten Free",
    isFeatured: false
  },
  {
    name: "Organic Turkish Dried Figs",
    categorySlug: "snacks",
    price: "5.49",
    unit: "300g pack",
    stockQuantity: 26,
    lowStockThreshold: 6,
    description: "Naturally sun-ripened soft figs, rich in dietary fiber with no added sugars or preservatives.",
    imageUrl: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80",
    badge: "Sun Dried",
    isFeatured: false
  }
];

export const sampleUsers = [
  {
    name: "Admin Sarah Jenkins",
    email: "admin@freshharvest.com",
    password: "adminpassword123",
    role: "admin" as const,
    phone: "+1 (555) 901-4433",
    address: "HQ Suite 400, Freshway Ave, Tech District"
  },
  {
    name: "David Miller (Delivery Staff)",
    email: "david.rider@freshharvest.com",
    password: "staffpassword123",
    role: "delivery" as const,
    phone: "+1 (555) 322-8819",
    address: "Hub #2 - Greenline Depot, North Wing"
  },
  {
    name: "Elena Rostova (Delivery Staff)",
    email: "elena.rider@freshharvest.com",
    password: "staffpassword123",
    role: "delivery" as const,
    phone: "+1 (555) 322-8820",
    address: "Hub #1 - Central Logistics Center"
  },
  {
    name: "Alex Customer",
    email: "customer@freshharvest.com",
    password: "customerpassword123",
    role: "customer" as const,
    phone: "+1 (555) 789-2244",
    address: "742 Evergreen Terrace, Apt 3B, Springfield"
  },
  {
    name: "Maya Lin",
    email: "maya.lin@example.com",
    password: "customerpassword123",
    role: "customer" as const,
    phone: "+1 (555) 441-9988",
    address: "128 Oakridge Boulevard, Floor 2, Brookside"
  }
];

export function getDeliverySlotsData() {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  return [
    {
      date: formatDate(today),
      timeWindow: "Today 1:00 PM - 3:00 PM (Express)",
      maxCapacity: 15,
      bookedCount: 14 // almost full
    },
    {
      date: formatDate(today),
      timeWindow: "Today 4:00 PM - 6:00 PM",
      maxCapacity: 20,
      bookedCount: 7
    },
    {
      date: formatDate(today),
      timeWindow: "Today 7:00 PM - 9:00 PM (Evening)",
      maxCapacity: 20,
      bookedCount: 3
    },
    {
      date: formatDate(tomorrow),
      timeWindow: "Tomorrow 9:00 AM - 11:00 AM (Morning Fresh)",
      maxCapacity: 20,
      bookedCount: 5
    },
    {
      date: formatDate(tomorrow),
      timeWindow: "Tomorrow 1:00 PM - 3:00 PM",
      maxCapacity: 20,
      bookedCount: 2
    },
    {
      date: formatDate(tomorrow),
      timeWindow: "Tomorrow 5:00 PM - 7:00 PM (Evening Rush)",
      maxCapacity: 20,
      bookedCount: 11
    },
    {
      date: formatDate(dayAfter),
      timeWindow: "Day After 10:00 AM - 12:00 PM",
      maxCapacity: 20,
      bookedCount: 0
    },
    {
      date: formatDate(dayAfter),
      timeWindow: "Day After 4:00 PM - 6:00 PM",
      maxCapacity: 20,
      bookedCount: 0
    }
  ];
}

export async function seedDatabase() {
  console.log("Seeding FreshHarvest database...");

  // 1. Seed Users
  for (const user of sampleUsers) {
    const userHash = await hashPassword(user.password);
    await db.insert(users).values({
      name: user.name,
      email: user.email,
      passwordHash: userHash,
      role: user.role,
      phone: user.phone,
      address: user.address,
    }).onConflictDoUpdate({
      target: users.email,
      set: {
        name: user.name,
        passwordHash: userHash,
        role: user.role,
        phone: user.phone,
        address: user.address,
      }
    });
  }

  // 2. Seed Categories
  const categoryMap = new Map<string, number>();
  for (const cat of sampleCategories) {
    const [inserted] = await db.insert(categories).values({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      color: cat.color,
    }).onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
      }
    }).returning({ id: categories.id, slug: categories.slug });

    categoryMap.set(cat.slug, inserted.id);
  }

  // 3. Seed Products
  for (const prod of sampleProducts) {
    const catId = categoryMap.get(prod.categorySlug);
    if (!catId) continue;

    const existingProduct = await db.select().from(products).where(sql`${products.name} = ${prod.name}`).limit(1);

    if (existingProduct.length === 0) {
      await db.insert(products).values({
        name: prod.name,
        categoryId: catId,
        price: prod.price,
        unit: prod.unit,
        stockQuantity: prod.stockQuantity,
        lowStockThreshold: prod.lowStockThreshold,
        description: prod.description,
        imageUrl: prod.imageUrl,
        badge: prod.badge,
        isFeatured: prod.isFeatured,
        inStock: prod.stockQuantity > 0,
      });
    } else {
      await db.update(products).set({
        categoryId: catId,
        price: prod.price,
        unit: prod.unit,
        stockQuantity: prod.stockQuantity,
        lowStockThreshold: prod.lowStockThreshold,
        description: prod.description,
        imageUrl: prod.imageUrl,
        badge: prod.badge,
        isFeatured: prod.isFeatured,
        inStock: prod.stockQuantity > 0,
      }).where(sql`${products.id} = ${existingProduct[0].id}`);
    }
  }

  // 4. Seed Delivery Slots
  // Clear old slots and repopulate fresh
  await db.delete(deliverySlots);
  const slots = getDeliverySlotsData();
  for (const slot of slots) {
    await db.insert(deliverySlots).values(slot);
  }

  console.log("Database seeded successfully with 28+ grocery products, categories, users, and slots!");
}
