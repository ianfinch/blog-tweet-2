SHELL := bash

.PHONY: all
all: zips

.PHONY: zips
zips:
	rm *.zip
	zip get-article.zip lambda-get-article.js utils.js aws.js node_modules config.json
	zip tweet-article.zip lambda-tweet-article.js utils.js aws.js node_modules config.json
