#!/usr/bin/env node

const fs = require("fs")
const stream = require("readable-stream")
const blockStreams = require("combined-stream").create()
const parse = require("csv-parse")

const argv = require("yargs")
  .usage("Usage: george [options]")
  .option("socks", {
    alias: "s",
    describe: "Specified a SOCKS5 proxy.",
    type: 'string'
  })
  .option("http", {
    alias: 'h',
    describe: 'Specified a HTTP proxy.',
    type: 'string'
  })
  .option("https", {
    alias: 'i',
    describe: 'Enable a secure HTTP proxy.',
    type: 'string'
  })
  .epilog(
    'This application designed for chinese only. \n' +
    "If you don't specified any proxy, \n" +
    'george will generate __PROXY__ placeholder instead of actual proxy, \n' +
    'shaodowsocks can handle it. \n'
  )
  .help()
  .argv

const location = {}
const inputStream = fs.createReadStream("database/GeoLite2-Country-Locations.csv")

inputStream
  .pipe(parse())
  .on("data", chunk => {
    location[chunk[0]] = chunk[4]
  })
  .on("error", error => {
    
  })
  .on("end", () => {

    blockStreams.append(fs.createReadStream("database/GeoLite2-Country-Blocks-IPv4.csv"))
    blockStreams.append(fs.createReadStream("database/GeoLite2-Country-Blocks-IPv6.csv"))

    const transform = function() {
      const kv = []
      return new stream.Transform({
        objectMode: true,
        flush(callback) {
          this.push("var blocks = " + JSON.stringify(kv))
          callback()
        },
        transform(chunk, encoding, callback) {
          if (location[chunk[1]] == "CN") kv.push(chunk[0])
          callback()
        }
      })
    }

    blockStreams
      .pipe(parse())
      .pipe(transform())
      .pipe(fs.createWriteStream("george.pac"))
      .on("error", error => {

      })
      .on("finish", () => {
        
        const proxy = []
        
        if (argv.socks) proxy.push("SOCKS " + argv.socks)
        if (argv.http) proxy.push("HTTP " + argv.http)
        if (argv.https) proxy.push("HTTPS " + argv.https)

        const main = fs.readFileSync("app.js")

        fs.appendFile(
          "george.pac",
          proxy.length > 0 ? main.replace(/__PROXY__/, proxy.join(";")) : main,
          error => {
            if (error) {

            }
          }
        )
      })
  })