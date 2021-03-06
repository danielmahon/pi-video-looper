FROM resin/rpi-node:0.10

# Install dependancies
RUN apt-get update && apt-get install -y \
  sudo \
  libi2c-dev \
  git \
  dropbear \
  libpcre3 \
  fonts-freefont-ttf \
  dbus \
  libsmbclient\
  libssh-4 \
  libraspberrypi0

# Install omxplayer
ADD http://omxplayer.sconde.net/builds/omxplayer_0.3.6~git20150217~5337be8_armhf.deb /tmp/omxplayer_0.3.6~git20150217~5337be8_armhf.deb
RUN dpkg -i /tmp/omxplayer_0.3.6~git20150217~5337be8_armhf.deb

# Install forked omxplayer by Adafruit
#RUN wget https://github.com/adafruit/omxplayer/releases/download/2%2F10%2F2015/omxplayer-dist.tgz
#RUN tar xvfz omxplayer-dist.tgz -C /

# Create app and media directory
RUN mkdir -p /usr/src/app
RUN mkdir -p /usr/src/app/media

# Install WiringPi
WORKDIR /usr/src/app
RUN git clone git://git.drogon.net/wiringPi
WORKDIR wiringPi
RUN ./build
WORKDIR /usr/src/app
RUN rm -rf wiringPi

# Add app files
COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app

# Setup Dropbear SSH
ADD start /start
RUN chmod a+x /start

CMD [ "/start" ]
