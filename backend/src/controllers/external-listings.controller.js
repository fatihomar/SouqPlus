import { PrismaClient } from '@prisma/client';
import externalSyncService from '../services/external-sync.service.js';

const prisma = new PrismaClient();

export const getExternalListings = async (req, res, next) => {
  try {
    const { category, source, page = 1, limit = 20 } = req.query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const whereClause = { isActive: true };
    if (category) {
      whereClause.category = category.toUpperCase();
    }
    if (source) {
      whereClause.source = source.toUpperCase();
    }

    const [items, total] = await Promise.all([
      prisma.externalListing.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.externalListing.count({
        where: whereClause,
      })
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getExternalListingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await prisma.externalListing.findUnique({
      where: { id }
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'External listing not found'
      });
    }

    res.json({
      success: true,
      data: listing
    });
  } catch (error) {
    next(error);
  }
};

export const syncExternalListings = async (req, res, next) => {
  try {
    const { provider, ...params } = req.body;
    
    // In a real app, ensure this endpoint is protected by Admin role
    if (!provider) {
      return res.status(400).json({ success: false, message: 'Provider is required' });
    }

    const result = await externalSyncService.syncListings(provider.toUpperCase(), params);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};
