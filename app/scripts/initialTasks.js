(function(mifosX) {
    var defineHeaders = function($httpProvider, $translateProvider, ResourceFactoryProvider, HttpServiceProvider, $idleProvider, $keepaliveProvider, IDLE_DURATION, WARN_DURATION, KEEPALIVE_INTERVAL, FINERACT_BASE_URL) {
        var mainLink = getLocation(window.location.href);
        var host = "";
        var portNumber = "";
        var baseApiUrl = "";
        var baseApiUrlEnv = FINERACT_BASE_URL;

        const allowedHosts = ['localhost', 'fina.theoxygen.com', 'www.fina.theoxygen.com', 'staging-fina.internal.theoxygen.com', 'www.staging-fina.internal.theoxygen.com', 'fina.internal.oxygenx.africa', 'www.fina.internal.oxygenx.africa','localhost'];
        if (!allowedHosts.includes(mainLink.hostname)) {
            throw new Error("Untrusted URL detected: " + mainLink.hostname);
        }

        baseApiUrl = "https://" + mainLink.hostname + (mainLink.port ? ':' + mainLink.port : '');
        if (QueryParameters["baseApiUrl"]) {
            baseApiUrl = window.DOMPurify.sanitize(QueryParameters["baseApiUrl"]);
        }

        if (baseApiUrlEnv !== '$FINERACT_BASE_URL') {
            baseApiUrl = window.DOMPurify.sanitize(baseApiUrlEnv);
        }

        var queryLink = getLocation(baseApiUrl);
        host = "https://" + queryLink.hostname + (queryLink.port ? ':' + queryLink.port : '');
        portNumber = queryLink.port;

        $httpProvider.defaults.headers.common['Fineract-Platform-TenantId'] = 'default';
        ResourceFactoryProvider.setTenantIdenetifier('default');
        if (QueryParameters["tenantIdentifier"]) {
            $httpProvider.defaults.headers.common['Fineract-Platform-TenantId'] = window.DOMPurify.sanitize(QueryParameters["tenantIdentifier"]);
            ResourceFactoryProvider.setTenantIdenetifier(window.DOMPurify.sanitize(QueryParameters["tenantIdentifier"]));
        }

        ResourceFactoryProvider.setBaseUrl(host);
        HttpServiceProvider.addRequestInterceptor('demoUrl', function(config) {
            return _.extend(config, { url: host + config.url });
        });

        // Enable CORS! (see e.g. http://enable-cors.org/)
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        //Set headers
        $httpProvider.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';

        // Configure i18n and preffer language
        //$translateProvider.translations('en', translationsEN);
        //$translateProvider.translations('de', translationsDE);
        $translateProvider.useSanitizeValueStrategy('escaped');
        $translateProvider.useStaticFilesLoader({
            prefix: 'global-translations/locale-',
            suffix: '.json'
        });

        $translateProvider.preferredLanguage('en');
        $translateProvider.fallbackLanguage('en');
        //Timeout settings.
        $idleProvider.idleDuration(IDLE_DURATION); //Idle time
        $idleProvider.warningDuration(WARN_DURATION); //warning time(sec)
        $keepaliveProvider.interval(KEEPALIVE_INTERVAL); //keep-alive ping

        $httpProvider.interceptors = $httpProvider.interceptors || [];
        $httpProvider.interceptors.push(['$q', '$injector', function($q, $injector) {
            return {
                responseError: function(rejection) {
                    if (rejection.status === 401) {
                        var $rootScope = $injector.get('$rootScope');
                        if (typeof $rootScope.logout === 'function') {
                            $rootScope.logout();
                        }
                    }
                    return $q.reject(rejection);
                }
            };
        }]);
    };
    mifosX.ng.application.config(defineHeaders).run(function($log, $idle) {
        $log.info("Initial tasks are done!");
        $idle.watch();
    });
}(mifosX || {}));

 /**
     * Safely parses a URL and ensures it uses http(s) and is from an allowed host.
     * Throws an error if the URL is untrusted.
     * @param {string} href - The URL to parse.
     * @returns {URL} - The parsed URL object.
     */
    getLocation = function(href) {
        // Sanitize the input URL
        var sanitizedHref = window.DOMPurify.sanitize(href);

        // Use the URL constructor for robust parsing
        let urlObj;
        try {
            urlObj = new URL(sanitizedHref, window.location.origin);
        } catch (e) {
            throw new Error("Invalid URL provided.");
        }

        // Only allow http and https protocols
        if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
            throw new Error("Untrusted protocol detected: " + urlObj.protocol);
        }

        const allowedHosts = [
            'localhost',
            'fina.theoxygen.com',
            'www.fina.theoxygen.com',
            'staging-fina.internal.theoxygen.com',
            'www.staging-fina.internal.theoxygen.com',
            'fina.internal.oxygenx.africa',
            'www.fina.internal.oxygenx.africa',
            'localhost'
        ];

        if (!allowedHosts.includes(urlObj.hostname)) {
            throw new Error("Untrusted URL detected: " + urlObj.hostname);
        }

        return urlObj;
    }

    /**
     * Securely extracts query parameters from the current window location.
     * Decodes values, strips dangerous protocols.
     */
    const QueryParameters = (() => {
        const result = {};
        if (window.location.search) {
            const params = window.location.search.slice(1).split("&");
            for (let i = 0; i < params.length; i++) {
                let [key, value = ""] = params[i].split("=");
                key = decodeURIComponent((key || "").replace(/(?:javascript:|data:|vbscript:)/gi, "")).trim();
                value = decodeURIComponent((value || "").replace(/(?:javascript:|data:|vbscript:)/gi, "")).trim();
                result[key] = value;
            }
        }
        return result;
    })();
