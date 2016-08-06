<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>


<table class="aui">
    <ww:iterator value="@fieldlist">
        <ww:if test="./validated == false">
            <tr>
                <td>
                    <span class="aui-icon aui-icon-small aui-iconfont-close-dialog">Not validated</span>
                    <ww:property value="./displayName"/>
                    <ww:text name="'admin.project.import.summary.not.checked'"/>
                </td>
            </tr>
        </ww:if>
        <ww:elseIf test="./messageSet/hasAnyMessages == true">
            <ww:if test="./messageSet/hasAnyErrors == true">
                <tr>
                    <td>
                        <span class="aui-icon aui-icon-error">Error</span>
                        <ww:iterator value="./messageSet/errorMessages">
                            <div class="description"><ww:property value="escapeValuePreserveSpaces(.)" escape="false"/>
                                <ww:if test="../messageSet/linkForError(.) != null">
                                    <br/>
                                    <ww:if test="../messageSet/linkForError(.)/absolutePath == false" >
                                        <a href="<%= request.getContextPath() %><ww:property value="../messageSet/linkForError(.)/linkUrl"/>"><ww:property value="../messageSet/linkForError(.)/linkText"/></a>
                                    </ww:if>
                                    <ww:else>
                                        <a href="<ww:property value="../messageSet/linkForError(.)/linkUrl"/>"><ww:property value="../messageSet/linkForError(.)/linkText"/></a>
                                    </ww:else>
                                </ww:if>
                            </div>
                        </ww:iterator>
                    </td>
                </tr>
            </ww:if>
            <ww:if test="./messageSet/hasAnyWarnings == true">
                <tr>
                    <td>
                        <span class="aui-icon aui-icon-warning">Warning</span>
                        <ww:iterator value="./messageSet/warningMessages">
                            <div class="description"><ww:property value="escapeValuePreserveSpaces(.)" escape="false"/>
                                <ww:if test="../messageSet/linkForWarning(.) != null">
                                    <br/>
                                    <ww:if test="../messageSet/linkForWarning(.)/absolutePath == false" >
                                        <a href="<%= request.getContextPath() %><ww:property value="../messageSet/linkForWarning(.)/linkUrl"/>"><ww:property value="../messageSet/linkForWarning(.)/linkText"/></a>
                                    </ww:if>
                                    <ww:else>
                                        <a href="<ww:property value="../messageSet/linkForWarning(.)/linkUrl"/>"><ww:property value="../messageSet/linkForWarning(.)/linkText"/></a>
                                    </ww:else>
                                </ww:if>
                            </div>
                        </ww:iterator>
                    </td>
                </tr>
            </ww:if>
        </ww:elseIf>
        <ww:else>
            <tr>
                <td>
                    <span class="aui-icon aui-icon-success">OK</span>
                    <span><ww:property value="./displayName"/></span>
                </td>
            </tr>
        </ww:else>
    </ww:iterator>
</table>
