FROM nginx:alpine

COPY default.conf /etc/nginx/conf.d/default.conf

RUN rm -rf /usr/share/nginx/html/*


COPY . /usr/share/nginx/html

EXPOSE 80
