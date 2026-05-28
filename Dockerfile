FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Variáveis declaradas como ARG para serem passadas pelo EasyPanel em Build Arguments
ARG VITE_PLAN_NAME
ARG VITE_PLAN_AMOUNT
ARG VITE_API_URL

# Exporta como ENV para o Vite enxergar durante o build
ENV VITE_PLAN_NAME=$VITE_PLAN_NAME
ENV VITE_PLAN_AMOUNT=$VITE_PLAN_AMOUNT
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
