SHELL := bash

.PHONY: all
all: zips

.PHONY: zips
zips:
	zip get-article.zip lambda-get-article.js utils.js aws.js node_modules config.json
