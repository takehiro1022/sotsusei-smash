FROM tomcat:10.1-jdk21
WORKDIR /app
COPY . .
RUN mkdir -p build/classes
RUN javac -encoding UTF-8 -cp "/usr/local/tomcat/lib/*:src/main/webapp/WEB-INF/lib/*" -d build/classes src/main/java/*.java
RUN mkdir -p dist/WEB-INF/classes
RUN cp -r src/main/webapp/* dist/
RUN cp -r build/classes/* dist/WEB-INF/classes/
RUN rm -rf /usr/local/tomcat/webapps/*
RUN jar -cvf /usr/local/tomcat/webapps/sotsusei.war -C dist .
ENV CATALINA_OPTS="-Xms128m -Xmx256m"
ENV PORT=8080
RUN sed -i 's/port="8080"/port="${PORT}"/' /usr/local/tomcat/conf/server.xml
EXPOSE 8080
CMD ["catalina.sh", "run"]