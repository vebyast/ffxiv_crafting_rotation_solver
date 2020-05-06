# FFXIV Crafting Rotation Solver

Nerd sniped by firnagzen.

# How to install and use

First, you need canonical recipe data. Obtain the [Lodestone recipe
scraper](https://github.com/doxxx/lodestone-recipe-db-scraper) and run
it. This may take a while.

```bash
git clone https://github.com/doxxx/lodestone-recipe-db-scraper.git
cd lodestone-recipe-db-scraper
pipenv install
mkdir out
pipenv run python3 main.py -r all
```

Clone this repository. Build it with webpack:

```bash
yarn install
yarn run webpack
node dist/main.js
```

Then point it at the file you downloaded earlier, specifying a recipe
by friendly name:

```bash
node dist/main.js \
  ../lodestone-recipe-db-scraper/out/Leatherworker.json \
  "Grade 2 Skybuilders' Overalls"
```
