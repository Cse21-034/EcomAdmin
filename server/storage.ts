import {
  users,
  categories,
  products,
  orders,
  orderItems,
  cartItems,
  contactMessages,
  type User,
  type InsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type CartItem,
  type InsertCartItem,
  type ContactMessage,
  type InsertContactMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, gte, lte, inArray, count, sum, sql } from "drizzle-orm";

export interface IStorage {
  // User operations for JWT authentication
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser & { password: string }): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  incrementUserTokenVersion(id: number): Promise<void>;
  
  // Supplier management
  getPendingSuppliers(): Promise<User[]>;
  approveSupplier(supplierId: number, adminId: number): Promise<User>;
  deactivateUser(id: number): Promise<User>;

  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Product operations
  getProducts(filters?: {
    categoryId?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
    active?: boolean;
    supplierId?: number;
  }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Cart operations
  getCartItems(userId?: number, sessionId?: string): Promise<CartItem[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId?: number, sessionId?: string): Promise<void>;

  // Order operations
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrders(userId?: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  updateOrderStatus(id: number, status: string): Promise<Order>;

  // Contact operations
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
  updateContactMessageStatus(id: number, status: string): Promise<ContactMessage>;

  // Admin-specific operations
  getUsersWithStats(): Promise<any[]>;
  getSupplierStats(supplierId: number): Promise<any>;
  getAdminStats(): Promise<any>;
  getAllOrders(): Promise<Order[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations for JWT authentication
  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser & { password: string }): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async incrementUserTokenVersion(id: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        jwtTokenVersion: sql`${users.jwtTokenVersion} + 1`,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
  }

  // Supplier management
  async getPendingSuppliers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(and(eq(users.role, 'supplier'), eq(users.isApproved, false)));
  }

  async approveSupplier(supplierId: number, adminId: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        isApproved: true,
        approvedAt: new Date(),
        approvedBy: adminId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, supplierId))
      .returning();
    return user;
  }

  async deactivateUser(id: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Product operations
  async getProducts(filters?: {
    categoryId?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
    active?: boolean;
    supplierId?: string;
  }): Promise<Product[]> {
    let query = db.select().from(products);
    const conditions = [];

    if (filters?.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }

    if (filters?.search) {
      conditions.push(like(products.name, `%${filters.search}%`));
    }

    if (filters?.minPrice) {
      conditions.push(gte(products.price, filters.minPrice.toString()));
    }

    if (filters?.maxPrice) {
      conditions.push(lte(products.price, filters.maxPrice.toString()));
    }

    if (filters?.featured !== undefined) {
      conditions.push(eq(products.featured, filters.featured));
    }

    if (filters?.active !== undefined) {
      conditions.push(eq(products.active, filters.active));
    }

    if (filters?.supplierId) {
      conditions.push(eq(products.supplierId, filters.supplierId));
    }

    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(desc(products.createdAt));
    }

    return await query.orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Cart operations
  async getCartItems(userId?: string, sessionId?: string): Promise<CartItem[]> {
    const conditions = [];
    
    if (userId) {
      conditions.push(eq(cartItems.userId, userId));
    } else if (sessionId) {
      conditions.push(eq(cartItems.sessionId, sessionId));
    }

    if (conditions.length === 0) {
      return [];
    }

    return await db
      .select({
        id: cartItems.id,
        userId: cartItems.userId,
        sessionId: cartItems.sessionId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        size: cartItems.size,
        color: cartItems.color,
        createdAt: cartItems.createdAt,
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          images: products.images,
        },
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(and(...conditions))
      .orderBy(cartItems.createdAt);
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const conditions = [];
    
    if (item.productId) {
      conditions.push(eq(cartItems.productId, item.productId));
    }
    
    if (item.userId) {
      conditions.push(eq(cartItems.userId, item.userId));
    } else if (item.sessionId) {
      conditions.push(eq(cartItems.sessionId, item.sessionId));
    }
    
    if (item.size) {
      conditions.push(eq(cartItems.size, item.size));
    }
    
    if (item.color) {
      conditions.push(eq(cartItems.color, item.color));
    }

    const existingItem = await db
      .select()
      .from(cartItems)
      .where(and(...conditions));

    if (existingItem.length > 0) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem[0].quantity + item.quantity })
        .where(eq(cartItems.id, existingItem[0].id))
        .returning();
      return updatedItem;
    }

    // Create new item
    const [newItem] = await db.insert(cartItems).values(item).returning();
    return newItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId?: string, sessionId?: string): Promise<void> {
    const conditions = [];
    
    if (userId) {
      conditions.push(eq(cartItems.userId, userId));
    } else if (sessionId) {
      conditions.push(eq(cartItems.sessionId, sessionId));
    }

    if (conditions.length > 0) {
      await db.delete(cartItems).where(and(...conditions));
    }
  }

  // Order operations
  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    // Add order items
    const orderItemsWithOrderId = items.map(item => ({
      ...item,
      orderId: newOrder.id,
    }));
    
    await db.insert(orderItems).values(orderItemsWithOrderId);
    
    return newOrder;
  }

  async getOrders(userId?: string): Promise<Order[]> {
    const conditions = userId ? [eq(orders.userId, userId)] : [];
    return await db
      .select()
      .from(orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(orders.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Contact operations
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async updateContactMessageStatus(id: number, status: string): Promise<ContactMessage> {
    const [updatedMessage] = await db
      .update(contactMessages)
      .set({ status })
      .where(eq(contactMessages.id, id))
      .returning();
    return updatedMessage;
  }

  // Admin-specific operations
  async getUsersWithStats(): Promise<any[]> {
    return await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        productCount: count(products.id),
      })
      .from(users)
      .leftJoin(products, eq(users.id, products.supplierId))
      .groupBy(users.id)
      .orderBy(desc(users.createdAt));
  }

  async getSupplierStats(supplierId: string): Promise<any> {
    const [productStats] = await db
      .select({
        totalProducts: count(products.id),
        activeProducts: sum(sql`CASE WHEN ${products.active} = true THEN 1 ELSE 0 END`),
        lowStockProducts: sum(sql`CASE WHEN ${products.quantity} <= ${products.lowStockThreshold} THEN 1 ELSE 0 END`),
      })
      .from(products)
      .where(eq(products.supplierId, supplierId));

    const [orderStats] = await db
      .select({
        totalOrders: count(orders.id),
        totalRevenue: sum(orders.total),
      })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(products.supplierId, supplierId));

    return {
      ...productStats,
      ...orderStats,
    };
  }

  async getAdminStats(): Promise<any> {
    const [userStats] = await db
      .select({
        totalUsers: count(users.id),
        activeSuppliers: sum(sql`CASE WHEN ${users.role} = 'supplier' AND ${users.isActive} = true THEN 1 ELSE 0 END`),
      })
      .from(users);

    const [productStats] = await db
      .select({
        totalProducts: count(products.id),
      })
      .from(products);

    const [orderStats] = await db
      .select({
        totalOrders: count(orders.id),
        totalRevenue: sum(orders.total),
      })
      .from(orders);

    const [messageStats] = await db
      .select({
        unreadMessages: sum(sql`CASE WHEN ${contactMessages.status} = 'unread' THEN 1 ELSE 0 END`),
      })
      .from(contactMessages);

    return {
      ...userStats,
      ...productStats,
      ...orderStats,
      ...messageStats,
    };
  }
}

export const storage = new DatabaseStorage();
