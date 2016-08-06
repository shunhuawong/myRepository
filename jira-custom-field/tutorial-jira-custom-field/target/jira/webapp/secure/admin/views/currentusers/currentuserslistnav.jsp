<%@ taglib prefix="ww" uri="webwork" %>
<div class="aui-group count-pagination">
    <div class="results-count aui-item">
        <ww:text name="'admin.currentusers.data.results'">
            <ww:param name="'value0'"><ww:property value="/fromIndex"/></ww:param>
            <ww:param name="'value1'"><ww:property value="/toIndex"/></ww:param>
            <ww:param name="'value2'"><ww:property value="/pager/fullListSize"/></ww:param>
        </ww:text>
    </div>
    <div class="aui-item">
        <ol class="aui-nav aui-nav-pagination">
            <ww:if test="/pager/startPageURL">
                <li class="aui-nav-first"><a href="<ww:property value="/pager/startPageURL"/>" id="gotoStart"><ww:text name="'common.words.start'"/></a></li>
            </ww:if>
            <ww:if test="/pager/prevPageURL">
                <li class="aui-nav-previous"><a href="<ww:property value="/pager/prevPageURL"/>" id="gotoPrev"><ww:text name="'common.forms.previous'"/></a></li>
            </ww:if>
            <ww:if test="/pager/nextPageURL">
                <li class="aui-nav-next"><a href="<ww:property value="/pager/nextPageURL"/>" id="gotoNext"><ww:text name="'common.forms.next'" /></a></li>
            </ww:if>
            <ww:if test="/pager/endPageURL">
                <li class="aui-nav-last"><a href="<ww:property value="/pager/endPageURL"/>" id="gotoEnd"><ww:text name="'common.words.end'"/></a></li>
            </ww:if>
        </ol>
    </div>
</div>