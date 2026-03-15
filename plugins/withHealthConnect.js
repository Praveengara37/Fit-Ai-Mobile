const { withAndroidManifest } = require('@expo/config-plugins');

const withHealthConnect = (config) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults.manifest;
    const application = androidManifest.application[0];
    
    if (!application['activity-alias']) {
      application['activity-alias'] = [];
    }
    
    const hasAlias = application['activity-alias'].some(
      (alias) => alias.$['android:name'] === 'ViewPermissionUsageActivity'
    );
    
    if (!hasAlias) {
      application['activity-alias'].push({
        $: {
          'android:name': 'ViewPermissionUsageActivity',
          'android:exported': 'true',
          'android:targetActivity': '.MainActivity',
          'android:permission': 'android.permission.START_VIEW_PERMISSION_USAGE'
        },
        'intent-filter': [{
          action: [{ $: { 'android:name': 'android.intent.action.VIEW_PERMISSION_USAGE' } }],
          category: [{ $: { 'android:name': 'android.intent.category.HEALTH_PERMISSIONS' } }]
        }]
      });
    }
    
    return config;
  });
};

module.exports = withHealthConnect;
