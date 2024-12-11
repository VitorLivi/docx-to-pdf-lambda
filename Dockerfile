FROM public.ecr.aws/lambda/nodejs:20-x86_64

ENV PATH=/var/lang/bin:/usr/local/bin:/usr/bin/:/bin:/opt/bin

# Configure linker to correctly point to libraries
ENV LD_LIBRARY_PATH="/usr/lib:/usr/lib64"
RUN dnf install -y xorg-x11-fonts-* libSM.x86_64 libXinerama-devel libxslt google-noto-sans-cjk-fonts binutils tar gzip xz \
  openssl nss-tools dbus-libs cups-libs && dnf clean all

RUN cp /lib64/libssl.so.3 /lib64/libssl3.so

RUN mkdir ~/libre && cd ~/libre && curl -s -L https://download.documentfoundation.org/libreoffice/stable/24.8.3/rpm/x86_64/LibreOffice_24.8.3_Linux_x86-64_rpm.tar.gz | tar xvz
RUN cd ~/libre/LibreOffice_24.8.3.2_Linux_x86-64_rpm/RPMS/ && rpm -Uvh *.rpm && rm -fr ~/libre \
  && ln -s /opt/libreoffice24.8/program/soffice.bin /usr/bin/libreoffice

ENV HOME=/tmp

COPY ./index.js ${LAMBDA_TASK_ROOT}/

CMD [ "handler.handler" ]
