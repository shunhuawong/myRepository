/**
 * This script might yield overly pessimistic measurements, depending on how late it is executed.
 * For this reason, the script SHOULD NOT be an `async` script nor be loaded dynamically long after
 * `domContentLoadedEventEnd`.
 */
(function integrateDashboardWithBrowserMetrics() {
    var metrics = require("internal/browser-metrics");
    var $ = require("jquery");
    var DASHBOARD_PAGE_KEY = "jira.dashboard";

    /**
     * @param {HTMLIFrameElement} iframe
     * @returns a jQuery promise that is resolved when the element has loaded.
     */
    function whenIframeLoaded(iframe) {
        var loading = $.Deferred();

        // jQuery.load() does not execute the callback if the iframe is already loaded, so we need to handle the case
        // where it's already loaded.
        //
        // We wait for readyState "complete" (i.e. loadEventEnd) so we wait for images, as some gadgets (e.g. charts)
        // use dynamically generated images as core content. The down side of this is that we'll be overly pessimistic
        // for gadgets that _don't_ make critical use of images, but it's better to err on this side than the other.
        if (iframe.contentDocument && iframe.contentDocument.readyState === "complete") {
            // iframe was already loaded, so this will make the measurement more pessimistic
            loading.resolve();
        } else {
            $(iframe).load(function resolveIframeLoading() {
                loading.resolve();
            });
        }
        return loading.promise();
    }

    /**
     * @param {HTMLIFrameElement[]} iframes
     * @returns a jQuery promise that is resolved when all iframes matching the selector (at the point in time when the
     * method was called) have loaded. If no elements match the selector, the promise is resolved immediately.
     */
    function whenIframesLoaded(iframes) {
        var loadPromises = iframes.map(function toIframeLoadedPromise() {
            return whenIframeLoaded(this);
        });

        return $.when.apply($, loadPromises);
    }

    /**
     * @returns a jQuery promise that is resolved when the dashboard has initialized (i.e. all gadgets have been added
     * to the DOM).
     */
    function whenDashboardInitialized() {
        var initialized = $.Deferred();

        // Wait for the DOM to be ready so we can inspect the dashboard element.
        $(function inspectDashboard() {
            var dashboard = $("#dashboard");

            // Harden against this code running _not_ on a dashboard page.
            if (dashboard.length === 0) {
                initialized.reject();
            }

            // The HTML that's delivered to the browser has <div id="dashboard" class="initializing"> and when the
            // dashboard is been initialized the "initializing" class is removed. This can be used in a similar manner
            // to document.readyState to detect if the dashboard is _already_ initialized, or if we need to wait for the
            // "initialized" event.
            if (dashboard.hasClass("initializing")) {
                dashboard.on("initialized", function resolveDeferred() {
                    initialized.resolve();
                });
            } else {
                // dashboard was already loaded, but the iframes might not yet be, so the measurement accuracy
                // is unknown at this point
                initialized.resolve();
            }
        });

        return initialized.promise();
    }

    metrics.start({
        key: DASHBOARD_PAGE_KEY,
        isInitial: true
    });

    // Wait for the dashboard to be loaded, otherwise gadget iframes may not yet exist in the DOM.
    whenDashboardInitialized()
        .pipe(function waitForIframesToLoaded() {
            var iframes = $("#dashboard").find("iframe").get();
            return whenIframesLoaded(iframes);
        })
        .done(function endMeasurement() {
            metrics.end({key: DASHBOARD_PAGE_KEY});
        });
})();
