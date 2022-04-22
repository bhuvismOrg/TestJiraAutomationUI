#!/usr/bin/env node

var cli = require('cli'),
    fs = require('fs'),
    path = require('path'),
    nameGenerator = require('sillyname'),
    Bluebird = require('bluebird'),

    DELIMITER,
    OUTPUTDIR,
    FILEPREFIX,
    ENCODING,
    EXTENSION,

    splitContent = function (content) {
        var matches = content.split(DELIMITER);

        return new Bluebird(function (resolve, reject) {
            if (matches.length > 1) {
                matches = matches.map(function (match, index) {
                    if (index < matches.length - 1) {
                        return match + DELIMITER;
                    }
                    return match;
                });
                resolve(matches);
                return;
            }

            reject('No matches found');
        });
    },

    writeFiles = function (files) {
        // Get the digit count for later zeroing the files
        var filesDigitCount = files.length.toString().length;

        return new Bluebird(function (resolve, reject) {
            try {
                fs.mkdirSync(OUTPUTDIR);
            } catch (e) {
                reject(e);
            }

            cli.ok('Created directory ' + OUTPUTDIR);

            files.forEach(function (fileContent, fileNumber) {
                var leadingZero = '',
                    fileName;

                // Humans count from 1
                fileNumber += 1;

                // I know this is some kind of hacky, however it works pretty well
                for (var i = 0; i < filesDigitCount - fileNumber.toString().length; i++) {
                    leadingZero += '0';
                }

                fileName = FILEPREFIX + leadingZero + fileNumber + EXTENSION;
                fs.writeFile(OUTPUTDIR + fileName, fileContent, {
                    'encoding': ENCODING
                }, function (err) {
                    if (err) {
                        cli.error(err);
                    }
                    cli.ok('Created ' + fileName + ' in directory ' + OUTPUTDIR);
                });
            });
        });
    };

cli.parse({
    delimiter: ['d', 'Delimiter for file split', 'string'],
    directory: ['o', 'Output directory', 'path'],
    prefix: ['p', 'File output prefix', 'string', ''],
    encoding: ['c', 'Output file encoding', 'string', 'utf8'],
    extension: ['e', 'Output file extension', 'string', '']
});

cli.main(function (args, options) {
    if (!options.delimiter && typeof (options.delimiter) !== 'string') {
        this.fatal('Missing delimiter for splitting files');
    }

    DELIMITER = options.delimiter;

    if (!options.directory) {
        OUTPUTDIR = path.resolve(nameGenerator().toLowerCase().replace(' ', '')) + path.sep;
        this.info('Missing directory, will use the random directory: ' + OUTPUTDIR);
    } else {
        OUTPUTDIR = path.resolve(options.directory) + path.sep;
    }

    if (options.prefix !== '') {
        FILEPREFIX = options.prefix + '_';
    } else {
        FILEPREFIX = '';
    }

    ENCODING = options.encoding;
    EXTENSION = options.extension;

    this.info('Waiting for STDIN ...');
});

cli.withStdin(function (fileContent) {
    splitContent(fileContent).then(writeFiles).catch(function (err) {
        cli.fatal(err);
    });

});
