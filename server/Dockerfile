FROM ubuntu:latest

ENV NODE_ENV=production
WORKDIR /usr/src/app

# Install nodejs 16.17
RUN apt-get update && apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
# Install and start mysql
RUN apt-get install -y mysql-server
# RUN service mysql start

COPY . .

# Echo the files in the current directory
RUN ls -a

EXPOSE 3000
RUN chown -R root /usr/src/app
USER root

# Start the multi-service container
CMD ./start.sh