FUNCTION_NAME=$1

node_modules/.bin/esbuild \
    --bundle \
    --outfile=dist/tests.cjs \
    --platform=node \
    ./functions/$FUNCTION_NAME/tests.ts

node dist/tests.cjs
