FROM public.ecr.aws/lambda/nodejs:20-x86_64

ENV PATH=/var/lang/bin:/usr/local/bin:/usr/bin/:/bin:/opt/bin

ENV LD_LIBRARY_PATH="/usr/lib:/usr/lib64"
RUN dnf install -y xorg-x11-fonts-* libSM.x86_64 libXinerama-devel libxslt google-noto-sans-cjk-fonts binutils tar gzip xz \
    openssl nss-tools dbus-libs cups-libs && dnf clean all

RUN cp /lib64/libssl.so.3 /lib64/libssl3.so

RUN mkdir ~/libre && cd ~/libre && curl -s -L https://download.documentfoundation.org/libreoffice/stable/24.8.3/rpm/x86_64/LibreOffice_24.8.3_Linux_x86-64_rpm.tar.gz | tar xvz
RUN cd ~/libre/LibreOffice_24.8.3.2_Linux_x86-64_rpm/RPMS/ && rpm -Uvh *.rpm && rm -fr ~/libre \
    && ln -s /opt/libreoffice24.8/program/soffice.bin /usr/bin/libreoffice

COPY ./index.js ${LAMBDA_TASK_ROOT}/
COPY ./package.json ${LAMBDA_TASK_ROOT}/

RUN cd ${LAMBDA_TASK_ROOT} && npm install

ENV HOME=/tmp

# Trigger dummy run to generate bootstrap files to improve cold start performance
RUN touch /tmp/test.txt \
    && cd /tmp \
    && libreoffice --headless --invisible --nodefault --view \
    --nolockcheck --nologo --norestore --convert-to pdf \
    --outdir /tmp /tmp/test.txt \
    && rm /tmp/test.*; exit 0

CMD [ "index.handler" ]
