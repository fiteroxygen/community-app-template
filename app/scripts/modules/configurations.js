angular.module('configurations', [])
    .constant('API_VERSION', '/fineract-provider/api/v1')
    .constant('IDLE_DURATION', 5 * 60)
    .constant('WARN_DURATION', 3)
    .constant('FINERACT_BASE_URL', '$FINERACT_BASE_URL')
    .constant('KEEPALIVE_INTERVAL', 5 * 60)
    .constant('SECURITY', 'basicauth');
// Use SECURITY constant as 'oauth' to enable Oauth2 on community app
