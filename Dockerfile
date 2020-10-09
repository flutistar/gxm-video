FROM node:latest
COPY . .

RUN npm ci

ENV API_ADDRESS='http://gxm-video-platform.herokuapp.com'
ENV PROPERTY_ID=wolfjaw-studios
ENV STRIPE_PUBLIC_API_KEY=pk_test_kbodKK6lY1o02ZI3w9rOw1Ln00JU0YUHjz
ENV HOST=0.0.0.0
ENV API_URL=http://localhost:8000

RUN npm run build
CMD npm start