.PHONY: install serve build clean

node_modules:
	npm install -D

install: node_modules

serve: node_modules
	npx webpack-dev-server --env.development --public $(PROXY_ORIGIN)

build/submission.zip: node_modules
	npx webpack --env.production --progress
	zip -r9 $@ dist/

build: build/submission.zip
	./build/check.sh

clean:
	rm -rf node_modules/
	rm -f dist/bundle.js
	rm -f build/submission.zip
