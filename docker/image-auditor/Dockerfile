FROM node:8
MAINTAINER Lionel Burgbacher <lionel.burgbacher@heig-vd.ch>

COPY src /opt/app/

WORKDIR /opt/app/
RUN ["npm","install","moment","--save"]

ENTRYPOINT ["node", "/opt/app/auditor.js"]