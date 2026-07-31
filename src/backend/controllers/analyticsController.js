import { supabase } from '../config/supabase.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Analytics from '../models/Analytics.js';

// @desc    Log a page visit
// @route   POST /api/analytics/visit
// @access  Public
export const logVisit = async (req, res, next) => {
  try {
    const { path, postId, referrer } = req.body;
    if (!path) {
      return res.status(400).json({ success: false, message: 'Path is required' });
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Create a daily unique session hash to compute unique visitors
    const todayStr = new Date().toISOString().split('T')[0];
    // Simple hash using built-in string hashing (no crypto needed for analytics)
    const hashInput = `${ip}-${userAgent}-${todayStr}`;
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    const sessionHash = Math.abs(hash).toString(16);

    // Simple device detection
    let device = 'desktop';
    if (/mobile/i.test(userAgent)) {
      device = 'mobile';
    } else if (/tablet|ipad/i.test(userAgent)) {
      device = 'tablet';
    }

    await Analytics.create({
      path,
      post: postId || null,
      referrer: referrer || '',
      sessionHash,
      device
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard analytics aggregate reports
// @route   GET /api/analytics/overview
// @access  Private/Admin
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    // 1. Total views
    const totalViews = await Analytics.countDocuments({});

    // 2. Unique visitors — count distinct session hashes using Supabase
    let uniqueVisitors = 0;
    try {
      const { data: allHashes } = await supabase
        .from('analytics')
        .select('session_hash');
      if (allHashes) {
        const uniqueSet = new Set(allHashes.map(r => r.session_hash));
        uniqueVisitors = uniqueSet.size;
      }
    } catch (e) {
      console.warn('[Analytics] Could not count unique visitors:', e);
    }

    // 3. User registrations
    const totalRegistrations = await User.countDocuments({});

    // 4. Most viewed posts (limit 5)
    const topPosts = await Post.find({ status: 'published' })
      .select('title slug viewsCount likesCount publishedAt')
      .sort({ viewsCount: -1 })
      .limit(5);

    // 5. Traffic trends (views per day, last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();

    let trafficData = [];
    try {
      const { data } = await supabase
        .from('analytics')
        .select('visited_at, session_hash')
        .gte('visited_at', sevenDaysAgoISO);
      trafficData = data || [];
    } catch (e) {
      console.warn('[Analytics] Could not fetch traffic data:', e);
    }

    // Group by day
    const dayMap = {};
    for (const row of trafficData) {
      const day = row.visited_at ? row.visited_at.split('T')[0] : null;
      if (!day) continue;
      if (!dayMap[day]) dayMap[day] = { views: 0, visitors: new Set() };
      dayMap[day].views++;
      dayMap[day].visitors.add(row.session_hash);
    }

    // Fill in days with zero traffic
    const formattedTrends = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const match = dayMap[dateString];
      formattedTrends.push({
        date: dateString,
        views: match ? match.views : 0,
        visitors: match ? match.visitors.size : 0
      });
    }

    // 6. Device breakdown
    let deviceBreakdown = [];
    try {
      const { data } = await supabase
        .from('analytics')
        .select('device');
      if (data) {
        const deviceMap = {};
        for (const row of data) {
          const dev = row.device || 'unknown';
          deviceMap[dev] = (deviceMap[dev] || 0) + 1;
        }
        deviceBreakdown = Object.entries(deviceMap).map(([_id, count]) => ({ _id, count }));
      }
    } catch (e) {
      console.warn('[Analytics] Could not fetch device data:', e);
    }

    // 7. Referrer breakdown
    let referrerBreakdown = [];
    try {
      const { data } = await supabase
        .from('analytics')
        .select('referrer');
      if (data) {
        const refMap = {};
        for (const row of data) {
          const ref = row.referrer || 'direct';
          refMap[ref] = (refMap[ref] || 0) + 1;
        }
        referrerBreakdown = Object.entries(refMap)
          .map(([_id, count]) => ({ _id, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      }
    } catch (e) {
      console.warn('[Analytics] Could not fetch referrer data:', e);
    }

    res.json({
      success: true,
      data: {
        totalViews,
        uniqueVisitors,
        totalRegistrations,
        topPosts,
        trafficTrends: formattedTrends,
        deviceBreakdown,
        referrerBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};
