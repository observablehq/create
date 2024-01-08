#!/bin/bash

# if the PAT is included on the command line, add it to the URL
githubUrl="https://${1:+$1@}github.com/observablehq/create"

# try yarn first, if not use npm
if command -v yarn &> /dev/null; then
    yarn global add $githubUrl
    $(yarn global bin)/observablehq-create
elif command -v npm &> /dev/null; then
    # creat temp directory
    temp_dir=$(mktemp -d)
    # trap to ensure cleanup even if the script exits unexpectedly
    trap "rm -rf $temp_dir" EXIT
    npm install $githubUrl --prefix $temp_dir
    npm exec observablehq-create --prefix $temp_dir
fi

