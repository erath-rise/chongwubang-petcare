FROM --platform=linux/amd64 node:20


WORKDIR /app

# copy package.json and package-lock.json
COPY api/package*.json ./api/


RUN npm cache clean --force

# install dependencies
RUN cd api && npm install

# copy all files
COPY api ./api
COPY start.sh .


EXPOSE 8800



# add permission to start.sh
RUN chmod +x start.sh

# start the app
CMD ["/bin/sh", "start.sh"]