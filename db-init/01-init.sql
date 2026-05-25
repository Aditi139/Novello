-- Novello Database Initialization
-- Creates all databases for each microservice
-- NOTE: Tables are created by Spring Boot JPA (ddl-auto=update) at service startup.
--       This file only creates the databases and grants permissions.

CREATE DATABASE IF NOT EXISTS novello_users;
CREATE DATABASE IF NOT EXISTS novello_catalog;
CREATE DATABASE IF NOT EXISTS novello_orders;
CREATE DATABASE IF NOT EXISTS novello_payments;
CREATE DATABASE IF NOT EXISTS novello_inventory;
CREATE DATABASE IF NOT EXISTS novello_ebooks;
CREATE DATABASE IF NOT EXISTS novello_notifications;

-- Grant all privileges to novello user
GRANT ALL PRIVILEGES ON novello_users.* TO 'novello'@'%';
GRANT ALL PRIVILEGES ON novello_catalog.* TO 'novello'@'%';
GRANT ALL PRIVILEGES ON novello_orders.* TO 'novello'@'%';
GRANT ALL PRIVILEGES ON novello_payments.* TO 'novello'@'%';
GRANT ALL PRIVILEGES ON novello_inventory.* TO 'novello'@'%';
GRANT ALL PRIVILEGES ON novello_ebooks.* TO 'novello'@'%';
GRANT ALL PRIVILEGES ON novello_notifications.* TO 'novello'@'%';

FLUSH PRIVILEGES;
