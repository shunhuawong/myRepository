<%@ taglib prefix="ww" uri="webwork" %>

<html>
<head>
    <title><ww:text name="'attachfile.title.multiple'"/></title>
    <meta name="decorator" content="none" />
</head>
<body>
<textarea>
    <ww:property value="/responseAsJson" escape="true" />
</textarea>
</body>
</html>