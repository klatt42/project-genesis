// ================================
// PROJECT: Genesis Agent SDK - Week 11
// FILE: enterprise/marketplace/marketplace-platform.ts
// PURPOSE: Public marketplace for templates, components, and agents (Component 1.1)
// GENESIS REF: Week 11 - Enterprise & Ecosystem Expansion
// WSL PATH: ~/project-genesis/enterprise/marketplace/marketplace-platform.ts
// ================================

/**
 * Genesis Marketplace Platform
 *
 * Public marketplace with:
 * - Template and component distribution
 * - Search and discovery
 * - Ratings and reviews
 * - Purchase and installation
 * - Creator monetization
 * - Analytics and insights
 */

/**
 * Marketplace Item Type
 */
export type MarketplaceItemType = 'template' | 'component' | 'agent' | 'pattern';

/**
 * Price Type
 */
export type PriceType = 'free' | 'paid' | 'subscription';

/**
 * Billing Period
 */
export type BillingPeriod = 'monthly' | 'yearly' | 'one-time';

/**
 * Author
 */
export interface Author {
  id: string;
  name: string;
  verified: boolean;
  avatar?: string;
  bio?: string;
  website?: string;
}

/**
 * Price Configuration
 */
export interface PriceConfig {
  type: PriceType;
  amount?: number; // USD cents
  billing?: BillingPeriod;
  trialDays?: number;
}

/**
 * Review
 */
export interface Review {
  id: string;
  itemId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  comment: string;
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Marketplace Item
 */
export interface MarketplaceItem {
  id: string;
  type: MarketplaceItemType;
  name: string;
  description: string;
  longDescription?: string;
  author: Author;
  version: string;
  price: PriceConfig;
  downloads: number;
  rating: number; // 0-5
  ratingCount: number;
  reviews: Review[];
  screenshots: string[];
  documentation: string; // Markdown
  githubRepo?: string;
  homepage?: string;
  tags: string[];
  compatibility: string[]; // Genesis versions
  license: string;
  featured: boolean;
  verified: boolean;
  category: string;
  dependencies?: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'archived';
}

/**
 * Search Query
 */
export interface SearchQuery {
  text?: string;
  type?: MarketplaceItemType;
  tags?: string[];
  category?: string;
  priceType?: PriceType;
  minRating?: number;
  author?: string;
  featured?: boolean;
  verified?: boolean;
  sortBy?: 'relevance' | 'downloads' | 'rating' | 'recent' | 'name';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Install Result
 */
export interface InstallResult {
  success: boolean;
  itemId: string;
  itemName: string;
  version: string;
  installedTo: string;
  filesCreated: number;
  errors: string[];
  warnings: string[];
  duration: number;
}

/**
 * Purchase Result
 */
export interface PurchaseResult {
  success: boolean;
  transactionId: string;
  itemId: string;
  amount: number;
  currency: string;
  receipt?: string;
  errors: string[];
}

/**
 * Marketplace Statistics
 */
export interface MarketplaceStats {
  totalItems: number;
  totalDownloads: number;
  totalRevenue: number;
  activeCreators: number;
  byType: Record<MarketplaceItemType, number>;
  byCategory: Record<string, number>;
  topItems: Array<{
    item: MarketplaceItem;
    downloads: number;
    revenue: number;
  }>;
  topCreators: Array<{
    author: Author;
    items: number;
    downloads: number;
    revenue: number;
  }>;
}

/**
 * Marketplace Platform
 *
 * Manages the Genesis marketplace for templates, components, and agents
 */
export class MarketplacePlatform {
  private items: Map<string, MarketplaceItem>;
  private reviews: Map<string, Review>;
  private purchases: Map<string, PurchaseResult>;
  private downloads: Map<string, number>;

  constructor() {
    this.items = new Map();
    this.reviews = new Map();
    this.purchases = new Map();
    this.downloads = new Map();
  }

  /**
   * Initialize marketplace
   */
  async initialize(): Promise<void> {
    // In real implementation:
    // - Connect to marketplace database
    // - Set up search indexing (Elasticsearch/Algolia)
    // - Initialize payment processor (Stripe)
    // - Load featured items
    // - Set up CDN for assets

    console.log('Marketplace initialized');
  }

  /**
   * Search marketplace
   */
  async search(query: SearchQuery): Promise<MarketplaceItem[]> {
    let results = Array.from(this.items.values())
      .filter(item => item.status === 'published');

    // Text search
    if (query.text) {
      const searchText = query.text.toLowerCase();
      results = results.filter(item =>
        item.name.toLowerCase().includes(searchText) ||
        item.description.toLowerCase().includes(searchText) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchText))
      );
    }

    // Type filter
    if (query.type) {
      results = results.filter(item => item.type === query.type);
    }

    // Tags filter
    if (query.tags && query.tags.length > 0) {
      results = results.filter(item =>
        query.tags!.some(tag => item.tags.includes(tag))
      );
    }

    // Category filter
    if (query.category) {
      results = results.filter(item => item.category === query.category);
    }

    // Price type filter
    if (query.priceType) {
      results = results.filter(item => item.price.type === query.priceType);
    }

    // Rating filter
    if (query.minRating !== undefined) {
      results = results.filter(item => item.rating >= query.minRating!);
    }

    // Author filter
    if (query.author) {
      results = results.filter(item => item.author.id === query.author);
    }

    // Featured filter
    if (query.featured !== undefined) {
      results = results.filter(item => item.featured === query.featured);
    }

    // Verified filter
    if (query.verified !== undefined) {
      results = results.filter(item => item.verified === query.verified);
    }

    // Sort results
    const sortBy = query.sortBy || 'relevance';
    const sortOrder = query.sortOrder || 'desc';

    results.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'downloads':
          comparison = a.downloads - b.downloads;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'recent':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'relevance':
        default:
          // Simple relevance: featured > verified > rating > downloads
          const scoreA = (a.featured ? 1000 : 0) + (a.verified ? 100 : 0) + a.rating * 10 + Math.log(a.downloads + 1);
          const scoreB = (b.featured ? 1000 : 0) + (b.verified ? 100 : 0) + b.rating * 10 + Math.log(b.downloads + 1);
          comparison = scoreA - scoreB;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Pagination
    const offset = query.offset || 0;
    const limit = query.limit || 50;

    return results.slice(offset, offset + limit);
  }

  /**
   * Get item by ID
   */
  async getItem(itemId: string): Promise<MarketplaceItem | null> {
    const item = this.items.get(itemId);
    if (!item) return null;

    // Track view analytics
    // In real implementation, would increment view count

    return item;
  }

  /**
   * Install item
   */
  async installItem(
    itemId: string,
    projectId?: string
  ): Promise<InstallResult> {
    const startTime = Date.now();
    const item = await this.getItem(itemId);

    if (!item) {
      return {
        success: false,
        itemId,
        itemName: 'Unknown',
        version: '0.0.0',
        installedTo: projectId || 'global',
        filesCreated: 0,
        errors: [`Item not found: ${itemId}`],
        warnings: [],
        duration: Date.now() - startTime
      };
    }

    try {
      // In real implementation:
      // 1. Download item package from CDN
      // 2. Verify integrity (checksum)
      // 3. Check compatibility with current Genesis version
      // 4. Install to Genesis or specific project
      // 5. Run post-install scripts if any

      // Track download
      const currentDownloads = this.downloads.get(itemId) || 0;
      this.downloads.set(itemId, currentDownloads + 1);

      // Update item download count
      item.downloads++;

      return {
        success: true,
        itemId: item.id,
        itemName: item.name,
        version: item.version,
        installedTo: projectId || 'global',
        filesCreated: 0, // Would count actual files
        errors: [],
        warnings: [],
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        itemId: item.id,
        itemName: item.name,
        version: item.version,
        installedTo: projectId || 'global',
        filesCreated: 0,
        errors: [`Installation failed: ${error}`],
        warnings: [],
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Publish item (for creators)
   */
  async publishItem(item: Omit<MarketplaceItem, 'id' | 'downloads' | 'rating' | 'ratingCount' | 'reviews' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'status'>): Promise<string> {
    const itemId = this.generateId('item');

    const newItem: MarketplaceItem = {
      ...item,
      id: itemId,
      downloads: 0,
      rating: 0,
      ratingCount: 0,
      reviews: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: new Date(),
      status: 'pending' // Requires review before published
    };

    // In real implementation:
    // - Validate item package
    // - Run security scan
    // - Upload to CDN
    // - Queue for manual review
    // - Generate item page

    this.items.set(itemId, newItem);

    return itemId;
  }

  /**
   * Update item
   */
  async updateItem(
    itemId: string,
    updates: Partial<MarketplaceItem>
  ): Promise<void> {
    const item = this.items.get(itemId);
    if (!item) {
      throw new Error(`Item not found: ${itemId}`);
    }

    // Verify ownership (in real implementation)

    const updatedItem = {
      ...item,
      ...updates,
      id: item.id, // Preserve ID
      createdAt: item.createdAt, // Preserve creation date
      updatedAt: new Date()
    };

    this.items.set(itemId, updatedItem);

    // Notify users who have installed this item
    // In real implementation, would send update notifications
  }

  /**
   * Purchase item
   */
  async purchaseItem(
    itemId: string,
    userId: string
  ): Promise<PurchaseResult> {
    const item = await this.getItem(itemId);

    if (!item) {
      return {
        success: false,
        transactionId: '',
        itemId,
        amount: 0,
        currency: 'USD',
        errors: [`Item not found: ${itemId}`]
      };
    }

    if (item.price.type === 'free') {
      return {
        success: true,
        transactionId: this.generateId('txn'),
        itemId,
        amount: 0,
        currency: 'USD',
        errors: []
      };
    }

    try {
      // In real implementation:
      // 1. Process payment via Stripe
      // 2. Grant access to user
      // 3. Send receipt email
      // 4. Track revenue
      // 5. Calculate creator payout

      const transactionId = this.generateId('txn');
      const purchase: PurchaseResult = {
        success: true,
        transactionId,
        itemId,
        amount: item.price.amount || 0,
        currency: 'USD',
        errors: []
      };

      this.purchases.set(transactionId, purchase);

      return purchase;
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        itemId,
        amount: item.price.amount || 0,
        currency: 'USD',
        errors: [`Payment failed: ${error}`]
      };
    }
  }

  /**
   * Submit review
   */
  async submitReview(
    itemId: string,
    userId: string,
    userName: string,
    rating: number,
    comment: string
  ): Promise<string> {
    const item = this.items.get(itemId);
    if (!item) {
      throw new Error(`Item not found: ${itemId}`);
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // In real implementation, verify user has purchased/used item

    const reviewId = this.generateId('review');
    const review: Review = {
      id: reviewId,
      itemId,
      userId,
      userName,
      rating,
      comment,
      helpful: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.reviews.set(reviewId, review);

    // Update item reviews
    item.reviews.push(review);

    // Recalculate item rating
    const totalRating = item.reviews.reduce((sum, r) => sum + r.rating, 0);
    item.rating = totalRating / item.reviews.length;
    item.ratingCount = item.reviews.length;

    return reviewId;
  }

  /**
   * Mark review as helpful
   */
  async markReviewHelpful(reviewId: string): Promise<void> {
    const review = this.reviews.get(reviewId);
    if (!review) {
      throw new Error(`Review not found: ${reviewId}`);
    }

    review.helpful++;
  }

  /**
   * Get item reviews
   */
  async getItemReviews(
    itemId: string,
    sortBy: 'recent' | 'rating' | 'helpful' = 'recent',
    limit?: number
  ): Promise<Review[]> {
    const item = this.items.get(itemId);
    if (!item) {
      return [];
    }

    let reviews = [...item.reviews];

    // Sort
    switch (sortBy) {
      case 'recent':
        reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'rating':
        reviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'helpful':
        reviews.sort((a, b) => b.helpful - a.helpful);
        break;
    }

    if (limit) {
      reviews = reviews.slice(0, limit);
    }

    return reviews;
  }

  /**
   * Get marketplace statistics
   */
  async getStatistics(): Promise<MarketplaceStats> {
    const items = Array.from(this.items.values());
    const publishedItems = items.filter(i => i.status === 'published');

    const totalItems = publishedItems.length;
    const totalDownloads = publishedItems.reduce((sum, i) => sum + i.downloads, 0);

    // Calculate total revenue from purchases
    const totalRevenue = Array.from(this.purchases.values())
      .filter(p => p.success)
      .reduce((sum, p) => sum + p.amount, 0);

    // Count active creators
    const creators = new Set(publishedItems.map(i => i.author.id));
    const activeCreators = creators.size;

    // Count by type
    const byType: Record<MarketplaceItemType, number> = {
      template: 0,
      component: 0,
      agent: 0,
      pattern: 0
    };

    for (const item of publishedItems) {
      byType[item.type]++;
    }

    // Count by category
    const byCategory: Record<string, number> = {};
    for (const item of publishedItems) {
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    }

    // Top items by downloads
    const topItems = [...publishedItems]
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 10)
      .map(item => ({
        item,
        downloads: item.downloads,
        revenue: 0 // Would calculate from purchases
      }));

    // Top creators
    const creatorStats = new Map<string, { author: Author; items: number; downloads: number; revenue: number }>();

    for (const item of publishedItems) {
      const existing = creatorStats.get(item.author.id);
      if (existing) {
        existing.items++;
        existing.downloads += item.downloads;
      } else {
        creatorStats.set(item.author.id, {
          author: item.author,
          items: 1,
          downloads: item.downloads,
          revenue: 0
        });
      }
    }

    const topCreators = Array.from(creatorStats.values())
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 10);

    return {
      totalItems,
      totalDownloads,
      totalRevenue,
      activeCreators,
      byType,
      byCategory,
      topItems,
      topCreators
    };
  }

  /**
   * Get featured items
   */
  async getFeaturedItems(limit: number = 10): Promise<MarketplaceItem[]> {
    return this.search({
      featured: true,
      sortBy: 'rating',
      limit
    });
  }

  /**
   * Get popular items
   */
  async getPopularItems(limit: number = 10): Promise<MarketplaceItem[]> {
    return this.search({
      sortBy: 'downloads',
      limit
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Create marketplace platform
 */
export function createMarketplacePlatform(): MarketplacePlatform {
  return new MarketplacePlatform();
}

/**
 * Example usage:
 *
 * ```typescript
 * import { createMarketplacePlatform } from './enterprise/marketplace/marketplace-platform.js';
 *
 * // Initialize marketplace
 * const marketplace = createMarketplacePlatform();
 * await marketplace.initialize();
 *
 * // Search for items
 * const results = await marketplace.search({
 *   text: 'react',
 *   type: 'template',
 *   minRating: 4.0
 * });
 *
 * // Install an item
 * const install = await marketplace.installItem('item_123', 'project_456');
 * console.log(`Installed ${install.itemName} v${install.version}`);
 *
 * // Purchase a paid item
 * const purchase = await marketplace.purchaseItem('item_789', 'user_123');
 * if (purchase.success) {
 *   console.log(`Purchase successful: ${purchase.transactionId}`);
 * }
 *
 * // Submit a review
 * const reviewId = await marketplace.submitReview(
 *   'item_123',
 *   'user_456',
 *   'John Doe',
 *   5,
 *   'Excellent template!'
 * );
 *
 * // Get marketplace stats
 * const stats = await marketplace.getStatistics();
 * console.log(`Total items: ${stats.totalItems}`);
 * console.log(`Total downloads: ${stats.totalDownloads}`);
 * console.log(`Total revenue: $${stats.totalRevenue / 100}`);
 * ```
 */
