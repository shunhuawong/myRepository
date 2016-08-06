define('jira/util/assistive', [
    'jira/util/navigator'
], function(
    Navigator
) {

    /**
     * When things become visible it takes a while for the browsers to expose
     * that information to the screen readers (or for the screen readers to recognise it).
     * The duration below is the shortest timeout that worked with AWS + NVDA + VoiceOver.
     */
    var ASSISTIVE_TIMEOUT = 50;

    /**
     * This is a workaround to fix JRA-45778 as suggested here:
     * http://connect.microsoft.com/IE/feedbackdetail/view/851144/assigning-textcontent-crashes-the-browser-tab
     * Basically for IE we are using the "innerText" property instead of "textContent" to set text on the element.
     */
    var textProperty = Navigator.isIE() ? "innerText" : "textContent";

    /**
     * Special hidden div. Its contents will be read by a screen reader.
     */
    var assistiveEl;

    var assistiveId = 0;

    /**
     * When things become visible it takes a while for the browsers to expose
     * that information to the screen readers (or for the screen readers to recognise it).
     * Using this function will make sure it happens at the right time.
     *
     * @param callback to be executed after the timeout
     */
    function wait(callback) {
        setTimeout(callback, ASSISTIVE_TIMEOUT);
    }

    /**
     * Sometimes it is needed to read some assistive text to the user through screen reader
     * even though it doesn't make much sense to give focus to the element that contains it.
     * E.g. "no results" message on a combobox.
     *
     * @param toRead text to be read by the screen reader
     */
    function readText(toRead) {
        if (!assistiveEl) {
            assistiveEl = document.createElement("div");
            assistiveEl.setAttribute("id", "assistive-text");
            assistiveEl.setAttribute("class", "visually-hidden");
            assistiveEl.setAttribute("aria-hidden", "false");
            assistiveEl.setAttribute("role", "status");
            assistiveEl.setAttribute("aria-live", "assertive");
            assistiveEl.setAttribute("aria-relevant", "additions");

            document.body.appendChild(assistiveEl);
        }

        // This needs to be an empty space because Chrome has/d an issue where it would only announce content to screen readers
        // when it changes from something, to something else. It doesn't announce if going from null to something.
        assistiveEl[textProperty] = " ";
        wait(function () {
            assistiveEl[textProperty] = toRead;
        });
    }

    /**
     * Creates an element that can later be used as "aria-describedby" on other
     * element to provide extra description for people with disabilities.
     *
     * If only text is passed, new element with random id will be created.
     * If id is passed, depending on the need, new element will be created
     * or the existing one will get updated with the new text.
     *
     * @param text the label should contain
     * @param id optional id of the element
     *
     * @returns id of the existing or created element
     */
    function createOrUpdateLabel(text, id) {
        if (!id) {
            id = "label-" + assistiveId;
            assistiveId += 1;
        }
        var element = document.getElementById(id);
        if (!element) {
            element = document.createElement("div");
            element.setAttribute("id", id);
            element.setAttribute("class", "visually-hidden");
            element.setAttribute("aria-hidden", "false");
            document.body.appendChild(element);
        }
        element[textProperty] = text;
        return id;
    }

    return {
        wait: wait,
        readText: readText,
        createOrUpdateLabel: createOrUpdateLabel
    };
});