# Songbirds

> **TODO** Add a little description about this project.

## Development

``` sh
# Start webpack development server on port 4000 with hot-reloading. 🔥
make serve

# If you intend to hide the development server behind some sort of reverse
# proxy or layered network architecture (NGINX, K8s Ingress, etc.) that exposes
# a port that is not 4000, then the HMR socket will fail to connect. You will
# need to explicitly specify the proxy origin. E.g.
make serve PROXY_ORIGIN=https://songbirds.nutty.dev:80
```

## Build

``` sh
# Build, minify, and zip everything up for submission!
# Output: build/submission.zip
make build
```
