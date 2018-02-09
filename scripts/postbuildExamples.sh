#!/bin/bash

# Copyright 2017 California Institute of Technology.
#
# This source code is licensed under the APACHE 2.0 license found in the
# LICENSE.txt file in the root directory of this source tree.


if [ -d dist ]; then
  rm -rf dist
fi

mkdir dist

for path in ./example_*; do
    [ -d "${path}" ] || continue # if not a directory, skip
    dirname="$(basename "${path}")"

    echo "Fixing ${dirname}"

    # Copy default data
    cp -r ./src/default-data ${dirname}/

    # Copy public assets
    cp -r ./assets/* ${dirname}/

    # Copy over config
    cp ./src/config.js ${dirname}/

    # move directory into dist for serving
    mv ${dirname} dist/
done

