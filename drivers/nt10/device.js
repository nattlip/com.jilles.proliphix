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
        this.thermostatTempCommand = 'OID4.1.13'
        this.thermostatThermSetbackHeatCommand = 'OID4.1.5' 
        this.thermostatThermHvacStateCommand = 'OID4.1.2'
        this.thermostatGetCommand = `/get?${this.thermostatTempCommand}=&${this.thermostatThermSetbackHeatCommand}=&${this.thermostatThermHvacStateCommand}=` // = path in req

        // register a capability listener
        this.registerCapabilityListener('measure_temperature', this.onCapabilityMeasure_temperature.bind(this))
        this.registerCapabilityListener('target_temperature', this.onCapabilityTarget_temperature.bind(this))
        this.registerCapabilityListener('thermostat_mode', this.onCapabilityThermostat_mode.bind(this))


        

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
            this.req(this.ip, this.port, this.thermostatGetCommand, this.thermostatmethod, this.thermostatusername, this.thermostatpassword);
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

    onCapabilityTarget_temperature(value, opts, callback) {

        // ... set value to real device
        util.log(` onCapabilityTarget_temperature fired with value`, value)
        util.log(` onCapabilityTarget_temperature fired with opts`, util.inspect(opts))

        // return (5 / 9) * c + 32

        let valueNumber = Number(value)

           util.log(`valueNumber `, valueNumber)

        let fahrenheid = (((( 9/5) * valueNumber + 32)).toFixed(0))*10

        util.log(`fahrenheid `, fahrenheid)

        let path = `/pdp?OID4.1.5=${fahrenheid}&submit=Submit`
        let method = 'POST'

        this.req(this.ip, this.port, path, method, this.thermostatusername, this.thermostatpassword)



        // Then, emit a callback ( err, result )
        callback(null);

        // or, return a Promise
        return Promise.reject(new Error('Switching the device failed!'));}





    onCapabilityThermostat_mode(value, opts, callback) {

        // ... set value to real device
        util.log(` onCapabilityThermostat_mode fired with value`, value)
        util.log(` onCapabilityThermostat_mode fired with opts`, util.inspect(opts))
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

                this.req(this.ip, this.port, this.thermostatGetCommand, this.thermostatmethod, this.thermostatusername, this.thermostatpassword);

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

                if (method == 'GET') {

                    // average temp
                    let is2 = result.indexOf(`ID4.1.13=`)
                    let strippedresult2 = result.slice(is2 + 1 + 8, is2 + 12)
                    util.log(`strippedresult2 req`, strippedresult2)
                    let answer2 = parseInt(strippedresult2)
                    util.log(`int strippedresult2 `, parseInt(strippedresult2))
                    let temp = (((answer2 / 10) - 32) / 1.8).toFixed(2)
                    util.log(`temperature`, `  ${temp}  Celsius`)
                    this.setCapabilityValue(`measure_temperature`, Number(temp))


                    // target temp
                    let is3 = result.indexOf(`ID4.1.5=`)
                    let strippedresult3 = result.slice(is3 + 1 + 7, is3 + 11)
                    util.log(`strippedresult3 req`, strippedresult3)
                    let answer3 = parseInt(strippedresult3)
                    util.log(`int strippedresult3 `, parseInt(strippedresult3))
                    let thermSetbackHeat = (((answer3 / 10) - 32) / 1.8).toFixed(2)
                    util.log(`thermSetbackHeat`, ` ${thermSetbackHeat} `)
                    this.setCapabilityValue(`target_temperature`, Number(thermSetbackHeat))




                    // hvac state 
                    let is4 = result.indexOf(`ID4.1.2=`)
                    let strippedresult4 = result.slice(is4 + 1 + 7, is4 + 9)
                    util.log(`strippedresult4 req`, strippedresult4)
                    let answer4 = strippedresult4
                    util.log(`int strippedresult4 `, strippedresult4)
                    let thermHvacState = ``
                    switch (answer4) {
                        case "1":
                            thermHvacState = `off`
                            break;
                        case "2":
                            thermHvacState = `off`
                            break;
                        case "3":
                            thermHvacState = `heat`
                    }
                    util.log(`thermHvacState`, ` ${thermHvacState} `)
                    this.setCapabilityValue(`thermostat_mode`, thermHvacState)

                } //if method
                else if (method == 'POST') {
                    let is3 = result.indexOf(`ID4.1.5=`)
                    let strippedresult3 = result.slice(is3 + 1 + 7, is3 + 11)
                    util.log(`strippedresult3 req`, strippedresult3)
                    let answer3 = parseInt(strippedresult3)
                    util.log(`int strippedresult3 `, parseInt(strippedresult3))
                    let thermSetbackHeat = (((answer3 / 10) - 32) / 1.8).toFixed(2)
                    util.log(`thermSetbackHeat set by Homey `, ` ${thermSetbackHeat} `)
                    this.setCapabilityValue(`target_temperature`, Number(thermSetbackHeat))
                } // else if 



                //let is = result.indexOf(`=`)
                //let questionmark = result.indexOf(`?`)
                //let strippedresult = result.slice(is+1, questionmark)
                //util.log(`strippedresult req`, strippedresult)
                //let answer = parseInt(strippedresult)        
                //let temp = (((answer/10) - 32)/1.8).toFixed(1)
              
                
                
                
            }); // end on end


        };// callbCK2

        //OID1.10.9=&OID1.2=&OID1.1=&OID1.4=&OID1.8=&OID2.7.1= 
       // let path = `/get?${this.thermostatTempCommand}=&${this.thermostatThermSetbackHeatCommand}=&${this.thermostatThermHvacStateCommand}=`                               // /get?OID4.1.13=
       // let path = '/get?OID4.1.13=&OID4.1.5=&OID4.1.2=&'

       // this.thermostatCommand = '?OID4.1.13='
      // let path = `/get${command}`  

       let path = command

        let options2 = {

            host: ip,
            port: port,
            path: path,
            method: method,
            auth: username + ':' + password,
            timeout: 1000,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'                
            }
        };








        console.log(' before req to be executed options2  ', options2);
        let req = http.request(options2, callback2);
        req.end();
        req.on('error', (e) =>{
            console.log('err req', e.message)
        });

    }// end request


    


}

module.exports = NT10Device;