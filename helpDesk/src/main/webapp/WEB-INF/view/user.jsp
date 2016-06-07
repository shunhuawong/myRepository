<%@ page language="java" contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>Insert title here</title>
  <link rel="stylesheet" type="text/css" href="../css/style.css">
</head>
<body id="center">
<div>
  <% String st = (String)request.getSession().getAttribute("message"); if(st != null)out.println(st); %>
  <br>
  <br>
  <form action="/user" method="post" style="width: 60%; margin: 0 auto; padding: 10px;">
    <p><strong>Enter your question:</strong></p>
    <p><input type="text" name="newQuestionTitle" placeholder="Title" size="43"></p>
    <p><textarea rows="10" cols="45" name="newQuestionText" placeholder="Enter your question here"></textarea></p>
    <p><input type="submit" name="submit" value="Submit"></p>
    <% String s = (String)request.getSession().getAttribute("questionsTable"); if(s != null)out.println(s); %>
  </form>
</div>
</body>
</html>
