FROM node:20 as build

WORKDIR /usr/src/app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --only-built-dependencies=@tailwindcss/vite,esbuild

COPY . .
RUN pnpm run build 

FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist /usr/share/nginx/html/frontend
RUN chown -R nginx:nginx /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]