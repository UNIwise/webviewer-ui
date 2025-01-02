MAIN_PATH="./node_modules/@storybook/react-dom-shim/dist/react"
V16="-16"
V18="-18"
JS=".js"
MJS=".mjs"

test -f $MAIN_PATH$V16$JS && cp $MAIN_PATH$V16$JS $MAIN_PATH$V18$JS
test -f $MAIN_PATH$V16$MJS && cp $MAIN_PATH$V16$MJS $MAIN_PATH$V18$MJS
