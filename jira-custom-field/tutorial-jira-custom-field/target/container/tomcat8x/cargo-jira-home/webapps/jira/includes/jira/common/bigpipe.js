require(['jquery', 'jira/skate'], function ($, skate) {
    skate('big-pipe', {

        attached: function (element) {

            function dataArrived(data) {
                try {
                    var parsedHtml = $(data);
                    $(element).replaceWith(parsedHtml);
                }
                catch (e) {
                    console.error('Error while parsing html: ' + e);
                    dataError(e);
                }
            }

            function dataError() {
                $(element).html('<div class="error">Unable to render element due to an error</div>')
            }

            var pipeId = element.getAttribute('data-id');
            if (pipeId == null) {
                console.error('No data-id attribute provided for tag <big-pipe/>.');
                dataError();
                return;
            }

            WRM.data.claim(pipeId, dataArrived, dataError);

        },

        detached: function (element) {

        },

        type: skate.type.ELEMENT,

        resolvedAttribute: 'resolved',
        unresolvedAttribute: 'unresolved'
    });

});
