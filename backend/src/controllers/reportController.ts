import { Request, Response } from 'express';
import knex from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';

export class ReportController {
  // Stock Opname Report
  static async getStockOpnameReport(req: AuthenticatedRequest, res: Response) {
    try {
      const { month, year, category_id } = req.query;
      
      let query = knex('inventory_items as ii')
        .leftJoin('categories as c', 'ii.category_id', 'c.id')
        .leftJoin('suppliers as s', 'ii.supplier_id', 's.id')
        .select(
          'ii.id',
          'ii.sku',
          'ii.name',
          'ii.quantity',
          'ii.minimum_stock',
          'ii.cost_price',
          'ii.selling_price',
          'ii.location',
          'c.name as category_name',
          's.name as supplier_name',
          'ii.updated_at'
        );

      // Filter by category if provided
      if (category_id) {
        query = query.where('ii.category_id', category_id);
      }

      const items = await query.orderBy('ii.name');

      // Calculate totals
      const summary = {
        total_items: items.length,
        total_stock_value: items.reduce((sum, item) => sum + (item.quantity * item.cost_price), 0),
        total_selling_value: items.reduce((sum, item) => sum + (item.quantity * item.selling_price), 0),
        low_stock_items: items.filter(item => item.quantity <= item.minimum_stock).length,
        out_of_stock_items: items.filter(item => item.quantity === 0).length
      };

      res.json({
        success: true,
        data: {
          items,
          summary,
          generated_at: new Date().toISOString(),
          period: month && year ? `${year}-${month.toString().padStart(2, '0')}` : 'current'
        }
      });
    } catch (error) {
      console.error('Stock opname report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating stock opname report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Monthly Movement Report
  static async getMonthlyMovementReport(req: AuthenticatedRequest, res: Response) {
    try {
      const { month, year } = req.query;
      const currentMonth = month ? parseInt(month as string) : new Date().getMonth() + 1;
      const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

      const startDate = new Date(currentYear, currentMonth - 1, 1);
      const endDate = new Date(currentYear, currentMonth, 0);

      // Get movements for the month
      const movements = await knex('inventory_movements as im')
        .join('inventory_items as ii', 'im.item_id', 'ii.id')
        .join('users as u', 'im.user_id', 'u.id')
        .leftJoin('categories as c', 'ii.category_id', 'c.id')
        .select(
          'im.id',
          'im.movement_type',
          'im.quantity',
          'im.reference_number',
          'im.notes',
          'im.created_at',
          'ii.name as item_name',
          'ii.sku',
          'ii.cost_price',
          'u.first_name',
          'u.last_name',
          'c.name as category_name'
        )
        .whereBetween('im.created_at', [startDate, endDate])
        .orderBy('im.created_at', 'desc');

      // Calculate movement summary
      const movementSummary = {
        total_movements: movements.length,
        stock_in: movements.filter(m => m.movement_type === 'in').length,
        stock_out: movements.filter(m => m.movement_type === 'out').length,
        adjustments: movements.filter(m => m.movement_type === 'adjustment').length,
        total_in_quantity: movements
          .filter(m => m.movement_type === 'in')
          .reduce((sum, m) => sum + Math.abs(m.quantity), 0),
        total_out_quantity: movements
          .filter(m => m.movement_type === 'out')
          .reduce((sum, m) => sum + Math.abs(m.quantity), 0),
        total_in_value: movements
          .filter(m => m.movement_type === 'in')
          .reduce((sum, m) => sum + (Math.abs(m.quantity) * m.cost_price), 0),
        total_out_value: movements
          .filter(m => m.movement_type === 'out')
          .reduce((sum, m) => sum + (Math.abs(m.quantity) * m.cost_price), 0)
      };

      res.json({
        success: true,
        data: {
          movements,
          summary: movementSummary,
          period: `${currentYear}-${currentMonth.toString().padStart(2, '0')}`,
          generated_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Monthly movement report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating monthly movement report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Stock Variance Report (for discrepancies)
  static async getStockVarianceReport(req: AuthenticatedRequest, res: Response) {
    try {
      const { category_id } = req.query;

      let query = knex('inventory_items as ii')
        .leftJoin('categories as c', 'ii.category_id', 'c.id')
        .select(
          'ii.id',
          'ii.sku',
          'ii.name',
          'ii.quantity as system_quantity',
          'ii.minimum_stock',
          'ii.cost_price',
          'c.name as category_name',
          'ii.updated_at'
        );

      if (category_id) {
        query = query.where('ii.category_id', category_id);
      }

      const items = await query.orderBy('ii.name');

      // Add physical_quantity field for manual input during stock take
      const stockVarianceItems = items.map(item => ({
        ...item,
        physical_quantity: null, // To be filled during physical count
        variance: null, // Will be calculated: physical_quantity - system_quantity
        variance_value: null, // variance * cost_price
        variance_percentage: null // (variance / system_quantity) * 100
      }));

      res.json({
        success: true,
        data: {
          items: stockVarianceItems,
          instructions: 'Fill physical_quantity during stock take, then use /reports/calculate-variance endpoint',
          generated_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Stock variance report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating stock variance report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Calculate Stock Variance
  static async calculateStockVariance(req: AuthenticatedRequest, res: Response) {
    try {
      const { items } = req.body; // Array of { id, physical_quantity }

      if (!items || !Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          message: 'Items array is required'
        });
      }

      const results = [];
      let totalVarianceValue = 0;

      for (const inputItem of items) {
        const item = await knex('inventory_items')
          .select('id', 'sku', 'name', 'quantity', 'cost_price')
          .where('id', inputItem.id)
          .first();

        if (item) {
          const variance = inputItem.physical_quantity - item.quantity;
          const varianceValue = variance * item.cost_price;
          const variancePercentage = item.quantity > 0 ? (variance / item.quantity) * 100 : 0;

          results.push({
            ...item,
            physical_quantity: inputItem.physical_quantity,
            system_quantity: item.quantity,
            variance,
            variance_value: varianceValue,
            variance_percentage: variancePercentage
          });

          totalVarianceValue += varianceValue;
        }
      }

      const summary = {
        total_items_counted: results.length,
        total_variance_value: totalVarianceValue,
        items_with_shortages: results.filter(r => r.variance < 0).length,
        items_with_overages: results.filter(r => r.variance > 0).length,
        items_accurate: results.filter(r => r.variance === 0).length
      };

      res.json({
        success: true,
        data: {
          variance_items: results,
          summary,
          calculated_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Calculate variance error:', error);
      res.status(500).json({
        success: false,
        message: 'Error calculating stock variance',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Analytics Dashboard
  static async getAnalyticsDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const { period = '30' } = req.query; // days
      const days = parseInt(period as string);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Top moving items
      const topMovingItems = await knex('inventory_movements as im')
        .join('inventory_items as ii', 'im.item_id', 'ii.id')
        .select('ii.id', 'ii.name', 'ii.sku')
        .sum('im.quantity as total_movement')
        .where('im.created_at', '>=', startDate)
        .groupBy('ii.id', 'ii.name', 'ii.sku')
        .orderBy('total_movement', 'desc')
        .limit(10);

      // Low stock alerts
      const lowStockItems = await knex('inventory_items as ii')
        .leftJoin('categories as c', 'ii.category_id', 'c.id')
        .select('ii.id', 'ii.name', 'ii.sku', 'ii.quantity', 'ii.minimum_stock', 'c.name as category_name')
        .whereRaw('ii.quantity <= ii.minimum_stock')
        .orderBy('ii.quantity');

      // Monthly trends (last 6 months)
      const monthlyTrends = await knex('inventory_movements')
        .select(
          knex.raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
          knex.raw('SUM(CASE WHEN movement_type = "in" THEN ABS(quantity) ELSE 0 END) as stock_in'),
          knex.raw('SUM(CASE WHEN movement_type = "out" THEN ABS(quantity) ELSE 0 END) as stock_out')
        )
        .where('created_at', '>=', knex.raw('DATE_SUB(NOW(), INTERVAL 6 MONTH)'))
        .groupBy(knex.raw('DATE_FORMAT(created_at, "%Y-%m")'))
        .orderBy('month');

      // Category distribution
      const categoryDistribution = await knex('inventory_items as ii')
        .join('categories as c', 'ii.category_id', 'c.id')
        .select('c.name as category_name')
        .count('ii.id as item_count')
        .sum('ii.quantity as total_quantity')
        .sum(knex.raw('ii.quantity * ii.cost_price as total_value'))
        .groupBy('c.id', 'c.name')
        .orderBy('total_value', 'desc');

      // Recent activities
      const recentActivities = await knex('inventory_movements as im')
        .join('inventory_items as ii', 'im.item_id', 'ii.id')
        .join('users as u', 'im.user_id', 'u.id')
        .select(
          'im.movement_type',
          'im.quantity',
          'im.created_at',
          'ii.name as item_name',
          'ii.sku',
          knex.raw('CONCAT(u.first_name, " ", u.last_name) as user_name')
        )
        .orderBy('im.created_at', 'desc')
        .limit(20);

      res.json({
        success: true,
        data: {
          top_moving_items: topMovingItems,
          low_stock_alerts: lowStockItems,
          monthly_trends: monthlyTrends,
          category_distribution: categoryDistribution,
          recent_activities: recentActivities,
          generated_at: new Date().toISOString(),
          period: `${days} days`
        }
      });
    } catch (error) {
      console.error('Analytics dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating analytics dashboard',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Export Stock Opname to CSV
  static async exportStockOpnameToCSV(req: AuthenticatedRequest, res: Response) {
    try {
      const { category_id } = req.query;

      let query = knex('inventory_items as ii')
        .leftJoin('categories as c', 'ii.category_id', 'c.id')
        .leftJoin('suppliers as s', 'ii.supplier_id', 's.id')
        .select(
          'ii.sku',
          'ii.name',
          'c.name as category',
          's.name as supplier',
          'ii.quantity as system_qty',
          knex.raw('NULL as physical_qty'),
          knex.raw('NULL as variance'),
          'ii.cost_price',
          'ii.selling_price',
          'ii.location',
          'ii.minimum_stock'
        );

      if (category_id) {
        query = query.where('ii.category_id', category_id);
      }

      const items = await query.orderBy('ii.name');

      // Generate CSV content
      const headers = [
        'SKU', 'Item Name', 'Category', 'Supplier', 'System Qty', 
        'Physical Qty', 'Variance', 'Cost Price', 'Selling Price', 
        'Location', 'Min Stock'
      ];

      const csvContent = [
        headers.join(','),
        ...items.map(item => [
          `"${item.sku}"`,
          `"${item.name}"`,
          `"${item.category || ''}"`,
          `"${item.supplier || ''}"`,
          item.system_qty,
          '', // physical_qty - to be filled manually
          '', // variance - to be calculated
          item.cost_price,
          item.selling_price,
          `"${item.location || ''}"`,
          item.minimum_stock
        ].join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="stock-opname-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error('Export CSV error:', error);
      res.status(500).json({
        success: false,
        message: 'Error exporting stock opname to CSV',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Stock Aging Report
  static async getStockAgingReport(req: AuthenticatedRequest, res: Response) {
    try {
      const { category_id } = req.query;

      let query = knex('inventory_items as ii')
        .leftJoin('categories as c', 'ii.category_id', 'c.id')
        .leftJoin(
          knex('inventory_movements')
            .select('item_id')
            .max('created_at as last_movement')
            .groupBy('item_id')
            .as('lm'),
          'ii.id', 'lm.item_id'
        )
        .select(
          'ii.id',
          'ii.sku',
          'ii.name',
          'ii.quantity',
          'ii.cost_price',
          'c.name as category_name',
          'lm.last_movement',
          knex.raw('DATEDIFF(NOW(), COALESCE(lm.last_movement, ii.created_at)) as days_since_movement'),
          knex.raw('ii.quantity * ii.cost_price as stock_value')
        );

      if (category_id) {
        query = query.where('ii.category_id', category_id);
      }

      const items = await query.orderBy('days_since_movement', 'desc');

      // Categorize by aging
      const agingCategories = {
        '0-30 days': items.filter(item => item.days_since_movement <= 30),
        '31-60 days': items.filter(item => item.days_since_movement > 30 && item.days_since_movement <= 60),
        '61-90 days': items.filter(item => item.days_since_movement > 60 && item.days_since_movement <= 90),
        '91-180 days': items.filter(item => item.days_since_movement > 90 && item.days_since_movement <= 180),
        '180+ days': items.filter(item => item.days_since_movement > 180)
      };

      const summary = Object.entries(agingCategories).map(([range, items]) => ({
        range,
        item_count: items.length,
        total_value: items.reduce((sum, item) => sum + parseFloat(item.stock_value), 0)
      }));

      res.json({
        success: true,
        data: {
          items,
          aging_categories: agingCategories,
          summary,
          generated_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Stock aging report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating stock aging report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
