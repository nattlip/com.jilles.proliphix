'use strict';


//const util = require('util');
const http = require('http.min');
const Homey = require('homey');

class superDevice extends Homey.Device {
    
    
        // this method is called when the Device is inited
        
        onInit  ()   {

            this.log('device init');
            this.log('name:', this.getName());
            this.log('class:', this.getClass());
            this.polleri = 0

            this.pollInterval = 60000  // 1 minute
            this.polling = false

            this.thermostattested = false
            this.thermostatset = false  // 2 possibilizties not online not set correct
            this.thermostatconnected = true 


            this.ip = ''
            this.port = ''
            this.thermostatusername = ''
            this.thermostatpassword = ''
            this.thermostattesting = true

            this.driver = this.getDriver().id
            this.log(`driver name`, this.driver)



            this.thermostatmethod = 'GET'

            // for nt10 averagge temp is temp1 local nt10
            this.thermostatTempCommand = 'OID4.1.13'

            // for nt20
            this.thermostatTempOneCommand = 'OID4.3.2.1'
            this.thermostatTempTwoCommand = 'OID4.3.2.2'
            this.thermostatTempThreeCommand = 'OID4.3.2.3'

            this.thermostatThermSetbackHeatCommand = 'OID4.1.5'
            this.thermostatThermHvacStateCommand = 'OID4.1.2'



            if (this.driver == 'nt10') {

                this.thermostatGetCommand = `/get?${this.thermostatTempCommand}\
=&${this.thermostatThermSetbackHeatCommand}\
=&${this.thermostatThermHvacStateCommand}=` // = path in req
                this.registerCapabilityListener('measure_temperature', this.onCapabilityMeasure_temperature.bind(this))


            }

            else if (this.driver == 'nt20') {

                this.thermostatGetCommand = `/get?${this.thermostatTempOneCommand}\
=&${this.thermostatTempTwoCommand}\
=&${this.thermostatTempThreeCommand}\
=&${this.thermostatThermSetbackHeatCommand}\
=&${this.thermostatThermHvacStateCommand}=` // = path in req

                this.registerCapabilityListener('measure_temperature_one', this.onCapabilityMeasure_temperature_one.bind(this))
                this.registerCapabilityListener('measure_temperature_two', this.onCapabilityMeasure_temperature_two.bind(this))
                this.registerCapabilityListener('measure_temperature_three', this.onCapabilityMeasure_temperature_three.bind(this))


            }


            // register a capability listener
            
            this.registerCapabilityListener('target_temperature', this.onCapabilityTarget_temperature.bind(this))
            this.registerCapabilityListener('thermostat_mode', this.onCapabilityThermostat_mode.bind(this))




            this.settings = this.getSettings();

            this.ip = this.settings.ip
            this.port = this.settings.port
            this.thermostatusername = this.settings.user
            this.thermostatpassword = this.settings.password


           // this.log(`driver `, this.inspect(this.getDriver()))
            this.log(`driver clasname `, this.getDriver().constructor.name)
            this.log(`driver name`, this.getDriver().id)


            this.log(`settings `, this.settings)


            // check if thermostat is set
            if (!(this.ip == undefined) && !(this.port == undefined) && !(this.thermostatusername == undefined) && !(this.thermostatpassword == undefined)) {
                this.thermostatset = true;

                this.log('test if thermostat is set this.thermostatset =  ', this.thermostatset);
                this.pollproliphix();
            } else {
                this.thermostatset = false;
                this.log('test if thermostat is set this.thermostatset =  ', this.thermostatset);
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
        onAdded  ()   {
            this.log('device added');
        }

        // this method is called when the Device is deleted
        onDeleted  ()   {
            this.log('device deleted');
        }

      //nt10
      // this method is called when the Device has requested a state change (turned on or off)
        onCapabilityMeasure_temperature  (value, opts, callback)  {

            // ... set value to real device

            // Then, emit a callback ( err, result )
            callback(null);

            // or, return a Promise
            return Promise.reject(new Error('Switching the device failed!'));
        }

    //nt20

        onCapabilityMeasure_temperature_one(value, opts, callback) {

            // ... set value to real device

            // Then, emit a callback ( err, result )
            callback(null);

            // or, return a Promise
            return Promise.reject(new Error('Switching the device failed!'));
        }

        onCapabilityMeasure_temperature_two(value, opts, callback) {

            // ... set value to real device

            // Then, emit a callback ( err, result )
            callback(null);

            // or, return a Promise
            return Promise.reject(new Error('Switching the device failed!'));
        }

        onCapabilityMeasure_temperature_three(value, opts, callback) {

            // ... set value to real device

            // Then, emit a callback ( err, result )
            callback(null);

            // or, return a Promise
            return Promise.reject(new Error('Switching the device failed!'));
        }



        onCapabilityTarget_temperature  (value, opts, callback)  {

            // ... set value to real device
            this.log(` onCapabilityTarget_temperature fired with value`, value)
            this.log(` onCapabilityTarget_temperature fired with opts`, opts)

            // return (5 / 9) * c + 32

            let valueNumber = Number(value)

            this.log(`valueNumber `, valueNumber)

            let fahrenheid = ((((9 / 5) * valueNumber + 32)).toFixed(0)) * 10

            this.log(`fahrenheid `, fahrenheid)

            let path = `/pdp?OID4.1.5=${fahrenheid}&submit=Submit`
            let method = 'POST'

            this.req(this.ip, this.port, path, method, this.thermostatusername, this.thermostatpassword)



            // Then, emit a callback ( err, result )
            callback(null);

            // or, return a Promise
            return Promise.reject(new Error('Switching the device failed!'));

            (error) => {
                this.log("error target temp ", error);
            }



        }





        onCapabilityThermostat_mode  (value, opts, callback)   {

            // ... set value to real device
            this.log(` onCapabilityThermostat_mode fired with value`, value)
            this.log(` onCapabilityThermostat_mode fired with opts`, opts)
            // Then, emit a callback ( err, result )
            callback(null);

            // or, return a Promise
            return Promise.reject(new Error('Switching the device failed!'));
        }








        // if socket is reachable
        pollproliphix() {
            this.log('entered pollproliphix')

            this.log('pollproliphix polleri before', this.polleri);

            this.log('pollproliphix  this.thermostatset', this.thermostatset);
            this.log('pollproliphix  this.testthermostat', this.thermostattested);
            this.log('pollproliphix  this.thermostatconnected', this.thermostatconnected);


            this.torepeat = () => {
                this.polleri += 1;
                this.log('pollproliphix polleri before', this.polleri);

                this.log('pollproliphix  this.thermostatset', this.thermostatset);
                this.log('pollproliphix  this.testthermostat', this.thermostattested);
                this.log('pollproliphix  this.thermostatconnected', this.thermostatconnected);


                if (this.thermostatset && this.thermostatconnected) {

                    this.req(this.ip, this.port, this.thermostatGetCommand, this.thermostatmethod, this.thermostatusername, this.thermostatpassword);

                };
                this.log('pollproliphix polleri after ', this.polleri);


            };


            this.toset = setInterval(() => { this.torepeat() }, this.pollInterval);

        }


       



        req  (ip, port, command, method, username, password) {

            let path = command

            let options = {

                protocol: 'http:',
                hostname: ip,
                port: port,
                path: path,
                method: method,
                auth: username + ':' + password,
                timeout: 3000,
                headers: {
                    'User-Agent': 'Node.js http.min'
                }

            }

            this.log(' before req http  min to be executed options  ', options);

            http(options).then((result) => {
                this.log(' result rsponse code   ', result.response.statusCode);

                if (result.response.statusCode == 200) {
                    if (method == 'GET')

                    { this.resolveGet(result) }

                    else if (method == 'POST')

                    { this.resolvePost(result) }
                }
            },
                (error) => {
                    this.log("request Failed!", error);
                }

            )
        }  // end req2

        resolveGet  (result)    {



            this.log(' result   ', result.data);



            if (this.driver == 'nt10') {

                this.log(' result nt10  ');

                // average temp
                let is2 = result.data.indexOf(`ID4.1.13=`)
                let strippedresult2 = result.data.slice(is2 + 1 + 8, is2 + 12)
                this.log(`strippedresult2 req`, strippedresult2)
                let answer2 = parseInt(strippedresult2)
                this.log(`int strippedresult2 `, parseInt(strippedresult2))
                let temp = (((answer2 / 10) - 32) / 1.8).toFixed(2)
                this.log(`temperature`, `  ${temp}  Celsius`)
                this.setCapabilityValue(`measure_temperature`, Number(temp))


            }

            else if (this.driver == 'nt20') {
                this.log(' result if nt20  ');
                // temp1
                let is = result.data.indexOf(`OID4.3.2.1=`)
                let strippedresult = result.data.slice(is + 1 + 10, is + 14)
                this.log(`strippedresult req`, strippedresult)
                let answer = parseInt(strippedresult)
                this.log(`int strippedresult `, parseInt(strippedresult))
                let temp = (((answer / 10) - 32) / 1.8).toFixed(2)
                this.log(`temperature 1`, `  ${temp}  Celsius`)
                this.setCapabilityValue(`measure_temperature_one`, Number(temp))

                // temp 2
                let is1 = result.data.indexOf(`OID4.3.2.2=`)
                let strippedresult1 = result.data.slice(is1 + 1 + 10, is1 + 14)
                this.log(`strippedresult1 req`, strippedresult1)
                //if (strippedresult1[0] == "-")
                //{ strippedresult1[0] = 0 } 
                let answer1 = parseInt(strippedresult1)
                this.log(`int strippedresult1 `, parseInt(strippedresult1))
                let temp1 = (((answer1 / 10) - 32) / 1.8).toFixed(2)
                this.log(`temperature 1`, `  ${temp1}  Celsius`)
                this.setCapabilityValue(`measure_temperature_two`, Number(temp1))

                // temp 3
                let is2 = result.data.indexOf(`OID4.3.2.3=`)
                let strippedresult2 = result.data.slice(is2 + 1 + 10, is2 + 14)
                this.log(`strippedresult2 req`, strippedresult2)
                //if (strippedresult2[0] == "-")
                //{ strippedresult2[0] = 0 } 
                let answer2 = parseInt(strippedresult2)
                this.log(`int strippedresult2 `, parseInt(strippedresult2))
                let temp2 = (((answer2 / 10) - 32) / 1.8).toFixed(2)
                this.log(`temperature`, `  ${temp2}  Celsius`)
                this.setCapabilityValue(`measure_temperature_three`, Number(temp2))

            }           



          


            // target temp
            let is3 = result.data.indexOf(`ID4.1.5=`)
            let strippedresult3 = result.data.slice(is3 + 1 + 7, is3 + 11)
            this.log(`strippedresult3 req`, strippedresult3)
            let answer3 = parseInt(strippedresult3)
            this.log(`int strippedresult3 `, parseInt(strippedresult3))
            let thermSetbackHeat = (((answer3 / 10) - 32) / 1.8).toFixed(2)
            this.log(`thermSetbackHeat`, ` ${thermSetbackHeat} `)
            if (thermSetbackHeat = '3,5')
            { thermSetbackHeat = '4' }
            this.setCapabilityValue(`target_temperature`, Number(thermSetbackHeat))




            // hvac state 
            let is4 = result.data.indexOf(`ID4.1.2=`)
            let strippedresult4 = result.data.slice(is4 + 1 + 7, is4 + 9)
            this.log(`strippedresult4 req`, strippedresult4)
            let answer4 = strippedresult4
            this.log(`int strippedresult4 `, strippedresult4)
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
            this.log(`thermHvacState`, ` ${thermHvacState} `)
            this.setCapabilityValue(`thermostat_mode`, thermHvacState)

        }

        resolvePost  (result)  {

            let is3 = result.data.indexOf(`ID4.1.5=`)
            let strippedresult3 = result.data.slice(is3 + 1 + 7, is3 + 11)
            this.log(`strippedresult3 req`, strippedresult3)
            let answer3 = parseInt(strippedresult3)
            this.log(`int strippedresult3 `, parseInt(strippedresult3))
            let thermSetbackHeat = (((answer3 / 10) - 32) / 1.8).toFixed(2)
            this.log(`thermSetbackHeat set by Homey `, ` ${thermSetbackHeat} `)
            this.setCapabilityValue(`target_temperature`, Number(thermSetbackHeat))



        }

   
}
module.exports =   superDevice