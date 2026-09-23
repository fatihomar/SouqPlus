import prisma from '../config/prisma.js';

class AdminService {
  async getStats() {
    const totalUsers = await prisma.user.count();
    const totalListings = await prisma.listing.count();
    const activeListings = await prisma.listing.count({ where: { status: 'ACTIVE' } });
    const reportedListings = await prisma.listing.count({ where: { status: 'REPORTED' } });
    
    const realEstateListings = await prisma.listing.count({ where: { category: 'REAL_ESTATE' } });
    const carListings = await prisma.listing.count({ where: { category: 'CAR' } });

    // Pending reports (total reports in system)
    const pendingReports = await prisma.report.count();

    return {
      totalUsers,
      totalListings,
      activeListings,
      reportedListings,
      realEstateListings,
      carListings,
      pendingReports
    };
  }

  async getUsers(page = 1, limit = 20, search = null, role = null, banned = null) {
    const skip = (page - 1) * limit;
    
    const where = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (role) {
      where.role = role;
    }
    if (banned !== null && banned !== undefined) {
      where.isBanned = banned === 'true' || banned === true;
    }
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          isBanned: true,
          createdAt: true,
          _count: {
            select: { listings: true }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      }
    };
  }

  async toggleUserBan(adminId, userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const error = new Error('المستخدم غير موجود');
      error.statusCode = 404;
      throw error;
    }

    if (user.role === 'ADMIN') {
      const error = new Error('لا يمكن حظر مدير نظام آخر');
      error.statusCode = 403;
      throw error;
    }

    const isBanning = !user.isBanned;

    // Transaction to update user, hide listings (if banning), and log audit
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { isBanned: isBanning },
        select: { id: true, fullName: true, email: true, isBanned: true }
      }),
      // If banning, hide all active listings
      ...(isBanning ? [
        prisma.listing.updateMany({
          where: { sellerId: userId, status: 'ACTIVE' },
          data: { status: 'REJECTED' }
        })
      ] : []),
      // Create Audit Log
      prisma.auditLog.create({
        data: {
          actorId: adminId,
          targetUserId: userId,
          action: isBanning ? 'BAN_USER' : 'UNBAN_USER',
          details: `تم ${isBanning ? 'حظر' : 'فك الحظر عن'} المستخدم`
        }
      })
    ]);

    return updatedUser;
  }

  async getListings(page = 1, limit = 20, status = null, search = null, category = null) {
    const skip = (page - 1) * limit;
    
    const where = {};
    if (status) {
      where.status = status;
    }
    if (category) {
      where.category = category;
    }
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          seller: {
            select: { id: true, fullName: true, email: true }
          }
        }
      }),
      prisma.listing.count({ where })
    ]);

    return {
      listings,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      }
    };
  }

  async updateListingStatus(adminId, listingId, status) {
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      const error = new Error('الإعلان غير موجود');
      error.statusCode = 404;
      throw error;
    }

    const validStatuses = ['ACTIVE', 'SOLD', 'RENTED', 'PENDING_REVIEW', 'EXPIRED', 'DELETED', 'REPORTED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      const error = new Error('حالة غير صالحة');
      error.statusCode = 400;
      throw error;
    }

    const [updatedListing] = await prisma.$transaction([
      prisma.listing.update({
        where: { id: listingId },
        data: { status }
      }),
      prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: 'UPDATE_LISTING_STATUS',
          details: `تم تغيير حالة الإعلان (${listing.id}) إلى ${status}`
        }
      })
    ]);

    return updatedListing;
  }

  async getAuditLogs(page = 1, limit = 20, action = null, adminId = null) {
    const skip = (page - 1) * limit;
    
    const where = {};
    if (action) where.action = action;
    if (adminId) where.actorId = adminId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          actor: { select: { id: true, fullName: true, email: true } },
          targetUser: { select: { id: true, fullName: true, email: true } }
        }
      }),
      prisma.auditLog.count({ where })
    ]);

    return {
      logs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      }
    };
  }
  async getReports(page = 1, limit = 20, status = null) {
    const skip = (page - 1) * limit;
    
    const where = {};
    if (status) {
      where.status = status;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          listing: { select: { id: true, title: true } }
        }
      }),
      prisma.report.count({ where })
    ]);

    return {
      reports,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      }
    };
  }

  async updateReportStatus(adminId, reportId, status) {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) {
      const error = new Error('OU,OU,OO OUSO U.U^OU^O_');
      error.statusCode = 404;
      throw error;
    }

    const validStatuses = ['PENDING', 'REVIEWING', 'RESOLVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      const error = new Error('O-O U,Oc OUSO OO U,O-Oc');
      error.statusCode = 400;
      throw error;
    }

    const [updatedReport] = await prisma.$transaction([
      prisma.report.update({
        where: { id: reportId },
        data: { status }
      }),
      prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: 'UPDATE_REPORT_STATUS',
          details: `OU. OOUSUSO O-O U,Oc OU,OU,OO (${report.id}) OU,U% ${status}`
        }
      })
    ]);

    return updatedReport;
  }

  async getSettings() {
    const settings = await prisma.systemSetting.findMany();
    const settingsObject = {};
    settings.forEach(s => {
      settingsObject[s.key] = s.value;
    });
    return settingsObject;
  }

  async updateSettings(adminId, settings) {
    const updatePromises = Object.entries(settings).map(([key, value]) => {
      return prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    });

    await prisma.$transaction([
      ...updatePromises,
      prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: 'UPDATE_SYSTEM_SETTINGS',
          details: 'OU. OO-O_USO OO1O_OO_OO OU,U+O,OU.'
        }
      })
    ]);

    return await this.getSettings();
  }
}

export default new AdminService();
