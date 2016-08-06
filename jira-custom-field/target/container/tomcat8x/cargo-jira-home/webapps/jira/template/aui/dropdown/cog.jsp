<%--

A component that draws an AUI cog drop down menu.

--%>
<%@ taglib uri="webwork" prefix="ww" %>
<ww:declare id="varId" value="parameters['id']"><ww:if test="."> id="<ww:property value="."/>"</ww:if></ww:declare>
<ww:declare id="varOwns" value="parameters['id']"><ww:if test="."> aria-owns="<ww:property value="."/>"</ww:if></ww:declare>
<ww:if test="parameters['model']/totalItems > 0">
    <button <ww:property value="@varOwns" escape="false"/> aria-haspopup="true" class="aui-button aui-button-subtle aui-button-compact aui-style-default aui-dropdown2-trigger">
        <span class="aui-icon aui-icon-small aui-iconfont-configure">
            <ww:property value="parameters['model']/topText"/>
        </span>
    </button>
    <div <ww:property value="@varId" escape="false"/> class="aui-style-default aui-dropdown2">
        <ww:iterator value="parameters['model']/sections" status="'status'">
            <ul class="aui-list-truncate">
                <ww:iterator value="./items">
                    <li>
                        <a class="<ww:property value="./attrAndRemove('class')"/>" href="<ww:url value="./attrAndRemove('href')"/>" <%-- The rest of the attrs --%>
                        <ww:iterator value="./attrs"><ww:property value="."/>="<ww:property value="../attr(.)"/>"</ww:iterator>>
                        <ww:property value="./text"/>
                        </a>
                    </li>
                </ww:iterator>
            </ul>
        </ww:iterator>
    </div>
</ww:if>
<ww:property id="varId" value="''"/>