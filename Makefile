SHELL := bash

.PHONY: all
all: zips

.PHONY: zips
zips:
	rm *.zip
	zip -r get-article.zip lambda-get-article.js utils.js aws.js node_modules config.json
	zip -r tweet-article.zip lambda-tweet-article.js utils.js aws.js node_modules config.json

.PHONY: backup
backup:
	node backup-lookups-db.js

.PHONY: restore
restore:
	node restore-lookups-db.js
