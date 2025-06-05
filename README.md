# echat-web

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

# Start server

## 1. build image

```sh
docker build -t echat-web:latest .
```

## 2. create docker network

```
docker network create echat-network
```

## 3. run container

```
docker run -dit --name echat-web \
    --network echat-network \
    -p 8888:80 \
    -e SERVER_HOST=echat-server \
    -e SERVER_PORT=8080 \
    echat-web:latest
```

> 注意：使用了docker network之后，SERVER_PORT应该是server容器内的端口，而不是通过-p映射的端口。
