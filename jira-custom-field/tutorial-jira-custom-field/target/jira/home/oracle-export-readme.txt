Oracle jira home export
--------------------

1. Create a database
https://confluence.atlassian.com/display/JIRA/Connecting+JIRA+to+Oracle

Open SQL command line
connect username/password

create tablespace jiradb2 datafile 'C:\oraclexe\app\oracle\oradata\XE\jiradb2.dbf' size 32m autoextend on next 32m maxsize 4096m extent management local;
create user jirauser2 identified by jirauser2 default tablespace jiradb2 quota unlimited on jiradb2;
grant connect to jirauser2;
grant create table to jirauser2;
grant create sequence to jirauser2;
grant create trigger to jirauser2;
grant read, write on directory data_pump_dir to jirauser2;


2. Download a standalone version of JIRA
https://www.atlassian.com/software/jira/download-archives\
Version: 6.3

// extract and set home directory
unzip atlassian-jira-6.3.zip
cd atlassian-jira-6.3-standalone/
mkdir home
echo "jira.home=`pwd`/home" > atlassian-jira/WEB-INF/classes/jira-application.properties

// db driver
// not necessary, already supplied in the zip

// start jira
bin/start-jira.sh

//configure db

Service: XE


// insert following license
AAABgw0ODAoPeNp1kkFPwkAQhe/9FZt4LmmrYiTpAegiIAKBgoZ42W4HWF12m9kW5d9bC41tg9e3b958M7M3AxRknEniuMT1Oo7X8dqELkPiOa5rRewQad2aCA7KAI1FKrTy6TSki/litKTWVpg9nKB0hKcE/EGu0RO8d0gAR5A6AbS41EfAmq1fSDXXNDtEgLPtygAa/97iWm1bjKfiCH6KGVjzDPmeGQhYCr7nuq7ttG3nwarkTtkB/ICu6WQ2p4vyhX4nAk9F2fx2WM5VjV4C5jijwO89PYb222p9Zz9vNkO757iv1odAVoMfjxZdQlUKmKAwjVl/qWuT5oLMQPErvnLkvsxMnjbVMRjfaSy+SOkV0n9Nq4RX7sQx4yKS9UP1L2It6IWJvINiOW1jaRz1V9wIyJVa9eU1X+NKfSr9pawZ7pgShhVE3VQyYwRTf0DVG/QRCl/zvOfOVWf576paAIajSIpGIZiUyDMM2Wokicx2QpG4JDXnjVXrL3+0Kv0AGd4bNDAsAhRW+KkhTg9ACxaro+gIxxowDSCtIgIUIWzKR3uE3+3rtlKrTA0zc/5vUtw=X02iq

// admin details

Full name: Administrator
Email: admin@example.com
Username: admin
Password: admin

// notifications
don't configure email options

// finally the dashboard shows up

// stop JIRA

// execute following queries to set relative paths:
TODO
UPDATE propertystring SET propertyvalue = './data/attachments' where ID = (SELECT ID FROM propertyentry where ENTITY_NAME = 'jira.properties' and ENTITY_ID = 1 AND PROPERTY_KEY = 'jira.path.attachments' AND propertytype = 5);
UPDATE propertystring SET propertyvalue = './export' where ID = (SELECT ID FROM propertyentry where ENTITY_NAME = 'jira.properties' and ENTITY_ID = 1 AND PROPERTY_KEY = 'jira.path.backup' AND propertytype = 5);

// export
SELECT owner, directory_name, directory_path FROM all_directories;
expdp jirauser2/jirauser2 DIRECTORY=data_pump_dir DUMPFILE=jiradb2.dmp
