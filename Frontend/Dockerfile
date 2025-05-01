FROM nginx:alpine

# Remove default Nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy static files (adjust 'dist/' to your actual directory)
COPY . /usr/share/nginx/html 

# Ensure correct permissions
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80
