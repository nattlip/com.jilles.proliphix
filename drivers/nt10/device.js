'use strict';

const util = require('util');
const http = require("http");
const Homey = require('homey');

class NT10Device extends Homey.Device {

    // this method is called when the Device is inited
    onInit() {
        this.log('device init');
        this.log('name:', this.getName());
        this.log('class:', this.getClass());
        this.polleri = 0

        this.pollInterval = 60000  // 1 minute
        this.polling = false

        this.thermostattested = false 
        this.thermostatset = false  // 2 possibilizties not online not set correct
        this.thermostatconnected = false
        

        this.ip = ''
        this.port = ''
        this.thermostatusername = ''
        this.thermostatpassword = ''
        this.thermostattesting = true 
        this.thermostatmethod = 'GET'
        this.thermostatCommand = '?OID4.1.13='

        // register a capability listener
        this.registerCapabilityListener('measure_temperature', this.onCapabilityMeasure_temperature.bind(this))

        this.settings = this.getSettings();

        this.ip = this.settings.ip
        this.port = this.settings.port
        this.thermostatusername = this.settings.user
        this.thermostatpassword = this.settings.password

        


        util.log(`settings `, util.inspect(this.settings))


        // check if thermostat is set
        if (!(this.ip == undefined) && !(this.port == undefined) && !(this.thermostatusername == undefined) && !(this.thermostatpassword == undefined)) {
            this.thermostatset = true;

            console.log('test if thermostat is set this.thermostatset =  ', this.thermostatset);
        } else {
            this.thermostatset = false;
            console.log('test if thermostat is set this.thermostatset =  ', this.thermostatset);
        }




        // test thermostat 
        if (!(this.ip == null) && !(this.port == null) && !(this.thermostatusername == null) && !(this.thermostatpassword == null)) {
            this.req(this.ip, this.port, this.thermostatCommand, this.thermostatmethod, this.thermostatusername, this.thermostatpassword);
            this.polleri += 1
        };









    //    this.setSettings({
    //        ip: "newValue",
    //        // only provide keys for the settings you want to change
    //    })
    //        .then(this.log)
    //        .catch(this.error)

    }

    // this method is called when the Device is added
    onAdded() {
        this.log('device added');
    }

    // this method is called when the Device is deleted
    onDeleted() {
        this.log('device deleted');
    }

    // this method is called when the Device has requested a state change (turned on or off)
    onCapabilityMeasure_temperature(value, opts, callback) {

        // ... set value to real device

        // Then, emit a callback ( err, result )
        callback(null);

        // or, return a Promise
        return Promise.reject(new Error('Switching the device failed!'));
    }



    // if socket is reachable
    pollproliphix ()  {
       this.torepeat  = ()  => {
            this.polleri += 1;
            console.log('pollproliphix polleri before', this.polleri);

            console.log('pollproliphix  this.thermostatset', this.thermostatset);
            console.log('pollproliphix  this.testthermostat', this.thermostattested);
            console.log('pollproliphix  this.thermostatconnected', this.thermostatconnected);


            if (this.thermostatset && this.thermostatconnected) {

                this.req(this.ip, this.port, this.thermostatCommand, this.thermostatmethod, this.thermostatusername, this.thermostatpassword);

            };
            console.log('pollproliphix polleri after ', this.polleri);


        };


        this.toset = setInterval( () => { this.torepeat() }, this.pollInterval);

    }


   req   (ip, port, command, method, username, password)  {

        let callback2 =  (response) => {
           let result = '';

            //another chunk of data has been recieved, so append it to `str`

            console.log('driver 174  callback2 entered ')

            response.on('data', function (chunk) {
                result += chunk;
                ;
            });

            //the whole response has been recieved, so we just print it out here
            response.on('end',  () =>  {


                console.log('req        response on end');

                console.log('req    before   if (this.thermostattested)      ', this.thermostattested);
                console.log('req   befor   if (response.statusCode == 200)      ', response.statusCode);
                console.log('req   before    if (!this.thermostatconnected)      ', !this.thermostatconnected);

                if (this.thermostattesting) {

                    console.log('req    after   if (this.thermostattesting)      ', this.thermostattesting);

                    

                    if (response.statusCode == 200) {
                        console.log('req   after    if (response.statusCode == 200)      ', response.statusCode);
                        this.thermostattested = true;
                        // only do a meesage if value chaneged
                        if (!this.thermostatconnected) {
                            console.log('app 268  after    if (!this.thermostatconnected)      ', !this.thermostatconnected);
                            console.log('app 269  server isconnected      ');

                            this.thermostatconnected = true;
                            this.thermostattesting = false // not more we are connected to  the server

                            if (!(this.polling)) {
                                this.polling = true
                                this.pollproliphix()
                            }

                            console.log('req  response.statusCode        ', response.statusCode);
                            console.log('req    this.testthermostat    ', this.thermostattested);
                        }; //connected
                    }
                } // end if testing
                //else {

                //  console.log('app 201 callback2 response.statusCode', response.statusCode)

                //  this.serverdata = str;   // to send to driver

                util.log(`result req`, result)
                let is = result.indexOf(`=`)
                let questionmark = result.indexOf(`?`)
                let strippedresult = result.slice(is+1, questionmark)
                util.log(`strippedresult req`, strippedresult)
                let answer = parseInt(strippedresult)
                util.log(`answer`, answer)

                let temp = (((answer/10) - 32)/1.8).toFixed(1)
              
                util.log(`temperature`, `  ${temp}  Celsius`)
                
                this.setCapabilityValue(`measure_temperature`, Number(temp))
            }); // end on end


        };// callbCK2


        let path =  `/get${command}`                               // /get?OID4.1.13=

        let options2 = {

            host: ip,
            port: port,
            path: path,
            method: method,
            auth: username + ':' + password

        };








        console.log(' before req to be executed options2  ', options2);
        var req = http.request(options2, callback2);
        req.end();
        req.on('error', function (err) {
            console.log('err req', err)
        });

    }// end request


    


}

module.exports = NT10Device;