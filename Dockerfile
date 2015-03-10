FROM resin/rpi-node:0.10

RUN mkdir -p /usr/src/app

RUN apt-get update && apt-get install -y sudo libi2c-dev git

# Install forked omxplayer by Adafruit
#RUN wget https://github.com/adafruit/omxplayer/releases/download/2%2F10%2F2015/omxplayer-dist.tgz
#RUN tar xvfz omxplayer-dist.tgz -C /

WORKDIR /usr/src/app
RUN git clone git://git.drogon.net/wiringPi
WORKDIR wiringPi
RUN ./build
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app

CMD [ "npm", "start" ]
