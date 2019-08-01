FROM node:12

ARG UID
ARG GID

RUN apt-get update
RUN apt-get install -y libaio1 netcat

EXPOSE 8009

RUN groupadd -g ${GID} docker
RUN useradd --create-home --shell /bin/false -u ${UID} -g ${GID} differ

ENV HOME /home/differ

RUN mkdir $HOME/diffconfabulator
RUN mkdir $HOME/diffconfabulator/result

WORKDIR $HOME/diffconfabulator
COPY package.json $HOME/diffconfabulator

RUN export && yarn

COPY . $HOME/diffconfabulator

WORKDIR $HOME/diffconfabulator/oraclient

RUN unzip instantclient-basic-linux.x64-19.3.0.0.0dbru.zip
RUN unzip instantclient-sqlplus-linux.x64-19.3.0.0.0dbru.zip

ENV LD_LIBRARY_PATH=$HOME/diffconfabulator/oraclient/instantclient_19_3:$LD_LIBRARY_PATH
ENV PATH=$HOME/diffconfabulator/oraclient/instantclient_19_3:$PATH

WORKDIR $HOME/diffconfabulator
RUN patch ./node_modules/oracledb/lib/oracledb.js ./oracledb_js.patch

RUN chown -R differ $HOME/diffconfabulator
USER differ
ENTRYPOINT node --experimental-modules  ./index.js
