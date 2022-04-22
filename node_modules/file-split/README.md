# file-split
Commandline tool for splitting a file into multiple files based on a given delemiter.

## Installation

``npm install -g file-split``


## Usage

```
Usage:
  file-split [OPTIONS] [ARGS]

Options:
  -d, --delimiter STRING Delimiter for file split
  -o, --directory PATH   Output directory
  -p, --prefix STRING    File output prefix
  -c, --encoding [STRING]Output file encoding (Default is utf8)
  -e, --extension STRING Output file extension
  -h, --help             Display help and usage details
```

Only the ``delemiter`` is mandatory, the rest is optional.

## Example

```
file-split --delimiter=";" --prefix="row" --directory="rows" --extension=".csv" < test.csv
```

This would create in the folder relative to your current location a directory called ``rows``containing a numbered list of files, e.g.: ``row_01.csv``
