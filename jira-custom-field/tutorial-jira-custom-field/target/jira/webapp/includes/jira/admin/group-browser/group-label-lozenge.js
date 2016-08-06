define('jira/admin/group-browser/group-label-lozenge', [
    'jquery',
    'jira/skate'
], function(
    $,
    skate
) {
    skate('group-label-lozenge', {
        type: skate.type.CLASSNAME,
        attached: function(element) {
            $(element).tooltip({gravity: 'w', html: true});
        }
    });
});
