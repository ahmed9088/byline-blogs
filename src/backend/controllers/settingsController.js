import Settings from '../models/Settings.js';

// @desc    Get website settings (singleton)
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({});
    if (!settings) {
      // Seed default settings if database is blank
      settings = await Settings.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update website settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = new Settings({});
    }

    settings.siteName = req.body.siteName || settings.siteName;
    settings.siteDescription = req.body.siteDescription || settings.siteDescription;
    settings.contactEmail = req.body.contactEmail || settings.contactEmail;
    
    if (req.body.socialLinks) {
      settings.socialLinks = {
        ...settings.socialLinks,
        ...req.body.socialLinks
      };
    }

    settings.logoUrl = req.body.logoUrl !== undefined ? req.body.logoUrl : settings.logoUrl;
    settings.faviconUrl = req.body.faviconUrl !== undefined ? req.body.faviconUrl : settings.faviconUrl;
    settings.googleAdsenseCode = req.body.googleAdsenseCode !== undefined ? req.body.googleAdsenseCode : settings.googleAdsenseCode;
    settings.googleAnalyticsId = req.body.googleAnalyticsId !== undefined ? req.body.googleAnalyticsId : settings.googleAnalyticsId;

    await settings.save();
    res.json({ success: true, message: 'Settings updated successfully', settings });
  } catch (error) {
    next(error);
  }
};
