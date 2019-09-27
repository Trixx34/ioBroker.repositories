const gulp = require('gulp');
const request = require('request');
const yargs = require('yargs');

// check if all adapters in stable have the version attribute
// and published attribute
gulp.task('init', done => {
    const scripts = require('./lib/scripts');
    scripts.init(() =>
        done());
});

gulp.task('stable', done => {
    const build = require('./lib/build');
    const tools = require('./lib/tools');
    tools.getRepositoryFile('https://raw.githubusercontent.com/' + tools.appName + '/' + tools.appName + '.repositories/master/sources-dist-stable.json', (err, data) => {
        if (err) {
            console.error(err);
            if (!data) process.exit(1);
        }
        build.getStats((err, stats) => {
            if (stats) {
                for (const adapter in stats) {
                    if (stats.hasOwnProperty(adapter) && data[adapter]) {
                        data[adapter].stat = stats[adapter];
                    }
                }
            }
            build.processRepository(data, ['--file', '/var/www/download/sources-dist-latest.json'], () =>
                done());
        });
    });
});

gulp.task('latest', done => {
    const build = require('./lib/build');
    const tools = require('./lib/tools');
    request('https://raw.githubusercontent.com/' + tools.appName + '/' + tools.appName + '.repositories/master/sources-dist-stable.json', (err, resp, body) => {
        const latest = JSON.parse(body);
        tools.getRepositoryFile('https://raw.githubusercontent.com/' + tools.appName + '/' + tools.appName + '.repositories/master/sources-dist.json', latest, (err, data) => {
            if (err) {
                console.error(err);
                !data && process.exit(1);
            }
            build.getStats((err, stats) => {
                if (stats) {
                    for (const adapter in stats) {
                        if (stats.hasOwnProperty(adapter) && data[adapter]) {
                            data[adapter].stat = stats[adapter];
                        }
                    }
                }
                build.processRepository(data, ['--file', '/var/www/download/sources-dist.json', '--shields', '/var/www/download/img'], () =>
                    done());
            });
        });
    });
});

gulp.task('sort', done => {
    const scripts = require('./lib/scripts');
    scripts.sort();
    done();
});

gulp.task('nodates', done => {
    const scripts = require('./lib/scripts');
    scripts.nodates();
    done();
});

gulp.task('addToLatest', async () => {
    const {name, type} = yargs.argv;
    if (typeof name !== 'string') throw new Error('Please specify the adapter name!');
    if (typeof type !== 'string') throw new Error('Please specify the adapter type!');

    const scripts = require('./lib/scripts');
    await scripts.addToLatest(name, type);
});