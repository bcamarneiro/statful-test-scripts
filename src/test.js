const Statful = require('statful-client');

const log = {
    debug: x => console.log(x),
    warn: x => console.log(x),
    error: x => console.log(x)
};

// Creates an object with the configuration and pass it to the client
const config = {
    app: 'nJSct',
    //default: {
    //    timer: { tags: { cluster: 'qa' }, agg: ['count'], aggFreq: 180 }
    //},
    transport: 'api',
    api: {
        timeout: 1000,
        token: 'TOKEN'
    },
    namespace: 'nodejstest',
    //tags: { cluster: 'production' },
    flushInterval: 1000,
    flushSize: 50,
    systemStats: true,
    dryRun: false
};

var statful = new Statful(config, log);

statful.use(new Statful.systemStatsPlugin({
    bufferFlushLength: true,
    timerEventLoop: true,
    processUptime: true,
    processMemoryUsage: true,
    processMemoryUsagePerc: true,
    osCpuUsage: true,
    osUptime: true,
    osTotalMemory: true,
    osFreeMemory: true,
    tagHostname: true,
    tagPlatform: true,
    tagArchitecture: true,
    tagNodeVersion: true
}));

var tThresholds = [1, 100];
var zThresholds = [100, 50000];

var theThing = null;

function getRandomValue (min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

var memoryLeaker = function () {
    // memory leak （°o°；）
    var originalThing = theThing;
    var unused = function () {
        if (originalThing) console.log('hi');
    };
    theThing = {
        longStr: new Array(1000000).join('*'),
        someMethod: function () {
            console.log('someMessage');
        }
    };
};

function getPrimes(max) {
    var sieve = [], i, j, primes = [];
    for (i = 2; i <= max; ++i) {
        if (!sieve[i]) {
            // i has not been marked -- it is prime
            primes.push(i);
            for (j = i << 1; j <= max; j += i) {
                sieve[j] = true;
            }
        }
    }
    return primes;
}

function load (array) {
    var z = [];
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        z.push(getPrimes(array.length));
    }
}

function sendMetric () {
    var z = getRandomValue(zThresholds[0], zThresholds[1]);
    var t = getRandomValue(tThresholds[0], tThresholds[1]);

    log.debug('>> ' + z + ' t=' + t);
    statful.counter('camarneiro.nodejs.test', z);

    //memoryLeaker(); //memory leak （°o°；）
    //load(new Array(z));

    setTimeout(sendMetric, t);
}

// Send metric
(function () {
    sendMetric();
})();
