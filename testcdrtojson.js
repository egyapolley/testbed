const soapRequest = require("easy-soap-request");

const utils = require("./utils");

const  moment = require("moment");

const parser = require('fast-xml-parser');
const he = require('he');

const options = {
    attributeNamePrefix: "@_",
    attrNodeName: "attr", //default is 'false'
    textNodeName: "#text",
    ignoreAttributes: true,
    ignoreNameSpace: true,
    allowBooleanAttributes: false,
    parseNodeValue: true,
    parseAttributeValue: false,
    trimValues: true,
    cdataTagName: "__cdata", //default is 'false'
    cdataPositionChar: "\\c",
    parseTrueNumberOnly: false,
    arrayMode: false,
    attrValueProcessor: (val, attrName) => he.decode(val, {isAttributeValue: true}),
    tagValueProcessor: (val, tagName) => he.decode(val),
    stopNodes: ["parse-me-as-string"]
};


const url = "http://172.25.39.13:3002";
const sampleHeaders = {
    'User-Agent': 'NodeApp',
    'Content-Type': 'text/xml;charset=UTF-8',
    'SOAPAction': 'urn:CCSCD7_QRY',
};

let xmlRequest = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pi="http://xmlns.oracle.com/communications/ncc/2009/05/15/pi">
   <soapenv:Header/>
   <soapenv:Body>
      <pi:CCSCD7_QRY>
         <pi:AUTH/>
         <pi:username>admin</pi:username>
         <pi:password>admin</pi:password>
         <pi:MSISDN>233255030602</pi:MSISDN>
         <pi:WALLET_TYPE>Primary</pi:WALLET_TYPE>
         <pi:EDR_TYPE>1</pi:EDR_TYPE>
         <pi:MAX_RECORDS>1000</pi:MAX_RECORDS>
         <pi:DAYS/>
         <pi:START_DATE>20201001000000</pi:START_DATE>
         <pi:END_DATE>20201021235959</pi:END_DATE>
      </pi:CCSCD7_QRY>
   </soapenv:Body>
</soapenv:Envelope>
`;

(async () => {
    console.time();
    try {
        const {response} = await soapRequest({url: url, headers: sampleHeaders, xml: xmlRequest, timeout: 3000}); // Optional timeout parameter(milliseconds)

        const {headers, body, statusCode} = response;
        /* console.log(body);
         console.log(headers);
         console.log(statusCode);*/

        if (parser.validate(body) === true) { //optional (it'll return an object in case it's not valid)
            let jsonObj = parser.parse(body, options);
            let result = jsonObj['Envelope']['Body']['CCSCD7_QRYResponse']['EDRS']['EDR_ITEM'];
            //console.log(result);

            let finalResult = []
            result.forEach(function (edr) {
                if (!edr.EXTRA_INFORMATION.includes("NACK=INSF")) {

                    let regex = /BALANCE_TYPES=(.+?)\|BALANCES=(.+?)\|COSTS=(.+?)\|.*TCS=(.+?)\|TCE=(.+?)\|.*RATING_GROUP=(.+?)\|/;
                    let matches = edr.EXTRA_INFORMATION.matchAll(regex);

                    for (const el of matches) {
                        let balance_type = el[1];
                        let balance_before = el[2];
                        let cost = el[3];
                        let start_time = el[4];
                        let end_time = el[5];
                        let rating_group = el[6];
                        if (balance_type.includes(",")) {
                            let balance_type_items = balance_type.split(",");
                            let cost_items = cost.split(",");
                            let balance_before_items = balance_before.split(",");
                            for (let i = 0; i < balance_type_items.length; i++) {
                                let edr_info = {};
                                edr_info.record_date = getDateFormat(edr.RECORD_DATE);
                                edr_info.balance_type = utils.getBundleName(balance_type_items[i]);
                                edr_info.balance_before = balance_before_items[i];
                                edr_info.cost = cost_items[i];
                                edr_info.balance_after =(parseInt(balance_before_items[i])-parseInt(cost_items[i])).toString()
                                edr_info.start_time = getDateFormat(start_time);
                                edr_info.end_time = getDateFormat(end_time);
                                edr_info.rating_group = rating_group;
                                finalResult.push(edr_info);

                            }

                        } else {
                            let edr_info = {};
                            edr_info.record_date = getDateFormat(edr.RECORD_DATE);
                            edr_info.balance_type = utils.getBundleName(balance_type);
                            edr_info.balance_before = balance_before;
                            edr_info.cost = cost;
                            edr_info.balance_after =(parseInt(balance_before)-parseInt(cost)).toString()
                            edr_info.start_time = getDateFormat(start_time);
                            edr_info.end_time = getDateFormat(end_time);
                            edr_info.rating_group = rating_group;
                            finalResult.push(edr_info)

                        }


                    }

                }


            });
            console.log(finalResult)
            console.timeEnd();
        }


    } catch (e) {
        console.log(e)


    }

})();


function getDateFormat(date){
    return moment(date,"YYYYMMDDhhmmss").format("YYYY-MM-DD hh:mm:ss")
}
