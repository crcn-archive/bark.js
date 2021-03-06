all: script examples

release:
	closure-compiler --js=bark.js --js_output_file=bark.min.js

script:
	browserify ./lib/index.js -o ./bark.js; \
	cp bark.js examples-src/js/bark.js;

examples:
	cd examples-src; \
	jekyll ../examples --auto --server 8080; \


clean:
	rm -rf examples; 

