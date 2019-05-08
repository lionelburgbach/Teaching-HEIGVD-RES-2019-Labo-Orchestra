FROM node:8
MAINTAINER Lionel Burgbacher <lionel.burgbacher@heig-vd.ch>

COPY src /opt/app/

WORKDIR /opt/app/
RUN ["npm","install","uuid","--save"]

ENTRYPOINT ["node", "/opt/app/musician.js"]