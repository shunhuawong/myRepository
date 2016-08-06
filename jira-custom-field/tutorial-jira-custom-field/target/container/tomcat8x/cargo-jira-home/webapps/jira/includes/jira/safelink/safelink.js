(function initSafeLink() {
    var $ = require('jquery');

    $(document).on('click', '.clickonce', function(e) {
        var link = e.target;
        if (link.clicked) {
            e.preventDefault();
        } else {
            link.clicked = true;
        }
    });

})();
