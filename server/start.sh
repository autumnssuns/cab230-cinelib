# Start mysql server 
service mysql start

# Dump database
mysql -u root < /usr/src/app/movies.sql

# Update password for root user
mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'secret';"

# Start express server
npm start

# Wait for either to exit
wait -n

exit $?