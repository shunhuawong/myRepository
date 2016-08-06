define ("wrm/require", [], function() {
    return function(ignore, callback) {
        // If any resources are by design fetched later, in setup they must be declared up front.

        // Notify, that setup has no WRM capability:
        console.warn('Resources will not be fetched asynchronously in setup.');

        // But call the callback immediately, all the data should be here:
        callback();
    }
});
