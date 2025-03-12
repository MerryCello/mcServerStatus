#!/bin/bash

# if arg 1 is empty then exit with message
if [ -z "$1" ]; then
  echo -e "\e[31mError: Version argument is required (patch | minor | major).\e[0m";
  exit 1;
fi

npx run-p test lint tsc &&
npm run build &&
npm version $1 &&
git push --tags &&
npx gh-pages -m $(node -p "require('./package.json').version") -d build &&
git push --no-verify;
