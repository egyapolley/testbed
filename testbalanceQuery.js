const soapRequest = require("easy-soap-request");

const utils = require("./utils");
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

let processBalance = false;
let processSubInfo =false;
let processAcctTags = false;

const url = "http://172.25.39.13:3002";
const sampleHeaders = {
    'User-Agent': 'NodeApp',
    'Content-Type': 'text/xml;charset=UTF-8',
    'SOAPAction': 'urn:CCSCD1_QRY',
};

let getBalancexml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pi="http://xmlns.oracle.com/communications/ncc/2009/05/15/pi">
   <soapenv:Header/>
   <soapenv:Body>
      <pi:CCSCD1_QRY>
         <pi:username>admin</pi:username>
         <pi:password>admin</pi:password>
         <pi:MSISDN>233255000102</pi:MSISDN>
         <pi:LIST_TYPE>BALANCE</pi:LIST_TYPE>
         <pi:WALLET_TYPE>Primary</pi:WALLET_TYPE>
         <pi:BALANCE_TYPE>ALL</pi:BALANCE_TYPE>
      </pi:CCSCD1_QRY>
   </soapenv:Body>
</soapenv:Envelope>`;


let getSubInfoxml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pi="http://xmlns.oracle.com/communications/ncc/2009/05/15/pi">
   <soapenv:Header/>
   <soapenv:Body>
      <pi:CCSCD1_QRY>
         <pi:username>admin</pi:username>
         <pi:password>admin</pi:password>
         <pi:MSISDN>233255000102</pi:MSISDN>
         <pi:WALLET_TYPE>Primary</pi:WALLET_TYPE>
      </pi:CCSCD1_QRY>
   </soapenv:Body>
</soapenv:Envelope>`;


let getTagsInfo =`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pi="http://xmlns.oracle.com/communications/ncc/2009/05/15/pi">
   <soapenv:Header/>
   <soapenv:Body>
      <pi:CCSCD9_QRY>
         <pi:AUTH/>
         <pi:username>admin</pi:username>
         <pi:password>admin</pi:password>
         <pi:MSISDN>233255000102</pi:MSISDN>
         <pi:TAG>IMSI|IMEI|DeviceType|AltSMSNotifNo|GiftTransferCount|TempTag</pi:TAG>
      </pi:CCSCD9_QRY>
   </soapenv:Body>
</soapenv:Envelope>`;

(async () => {
    console.time();
    try {
        /*............Processing Sub Balance...........*/

        const {response} = await soapRequest({url: url, headers: sampleHeaders, xml: getBalancexml, timeout: 3000}); // Optional timeout parameter(milliseconds)

        const {headers, body, statusCode} = response;

        let balanceResult = [];
        let general_acct_info =[];
        let acct_tags =[];

        let finalResult = {};



        if (parser.validate(body) === true) { //optional (it'll return an object in case it's not valid)
            let jsonObj = parser.parse(body, options);
            let result = jsonObj['Envelope']['Body']['CCSCD1_QRYResponse']['BALANCES']['BALANCE_ITEM'];

            if (result){
                processBalance= true;

                result.forEach(function (item) {
                    if (item.BUCKETS){
                        if (Array.isArray(item.BUCKETS.BUCKET_ITEM)){
                            let bucket_item = item.BUCKETS.BUCKET_ITEM;
                            bucket_item.forEach(function (bucket) {
                                let balance_data ={};
                                balance_data.balance_type = item.BALANCE_TYPE_NAME;
                                balance_data.value = bucket.BUCKET_VALUE;
                                balance_data.expiry_date = bucket.BUCKET_EXPIRY?utils.getDateFormat(bucket.BUCKET_EXPIRY):"n/a";
                                balanceResult.push(balance_data);

                            })

                        }else {
                            let balance_data ={};
                            balance_data.balance_type = utils.getBundleName(item.BALANCE_TYPE_NAME);
                            balance_data.value =item.BUCKETS.BUCKET_ITEM.BUCKET_VALUE;
                            balance_data.expiry_date =item.BUCKETS.BUCKET_ITEM.BUCKET_EXPIRY?utils.getDateFormat(item.BUCKETS.BUCKET_ITEM.BUCKET_EXPIRY):"n/a";
                            balanceResult.push(balance_data);

                        }
                    }


                });


            }

            /*............Processing SubInfo...........*/

            if (processBalance){
                const {response} = await soapRequest({url: url, headers: sampleHeaders, xml: getSubInfoxml, timeout: 3000});
                const {headers, body, statusCode} = response;
                let jsonObj = parser.parse(body, options);
                let acct_infoResult =jsonObj.Envelope.Body.CCSCD1_QRYResponse;
                if (acct_infoResult){
                    processSubInfo =true;
                    general_acct_info.push({parameterName:"Account Status",parameterValue:acct_infoResult['STATUS']});
                    general_acct_info.push({parameterName:"Service Class",parameterValue:acct_infoResult['PRODUCT']});
                    general_acct_info.push({parameterName:"Creation Date",parameterValue:utils.getDateFormat(acct_infoResult['CREATION_DATE'])});
                    general_acct_info.push({parameterName:"Initial Activation Date",parameterValue:utils.getDateFormat(acct_infoResult['FIRST_ACTIVATION_DATE'])});
                }

                /*............Processing Subscriber Tag.......*/

                if (processSubInfo){
                    const {response} = await soapRequest({url: url, headers: sampleHeaders, xml: getTagsInfo, timeout: 3000});
                    const {headers, body, statusCode} = response;
                    let jsonObj = parser.parse(body, options);
                    let acct_tags_jsonResult = jsonObj.Envelope.Body.CCSCD9_QRYResponse.TAGS.TAG;
                    acct_tags_jsonResult.forEach(function (tag) {
                        if (tag.NAME === 'AltSMSNotifNo') general_acct_info.push({parameterName:"Phone Contact",parameterValue:tag.VALUE?tag.VALUE:"n/a"});
                        if (tag.NAME === 'IMSI') general_acct_info.push({parameterName:"IMSI",parameterValue:tag.VALUE?tag.VALUE:"n/a"});
                        if (tag.NAME === 'IMEI') general_acct_info.push({parameterName:"IMEI",parameterValue:tag.VALUE?tag.VALUE:"n/a"});
                        if (tag.NAME === 'DeviceType') general_acct_info.push({parameterName:"Device Type",parameterValue:tag.VALUE?tag.VALUE:"n/a"});
                        if (tag.NAME === 'EmailID') general_acct_info.push({parameterName:"Email Address",parameterValue:tag.VALUE?tag.VALUE:"n/a"});

                        if (tag.NAME === 'GiftTransferCount') acct_tags.push({parameterName:"Gift Transfer Counter",parameterValue:tag.VALUE?tag.VALUE:"n/a"});
                        if (tag.NAME === 'TempTag' && /winback/i.test(tag.VALUE.toString())) acct_tags.push({parameterName:"Winback Status",parameterValue:tag.VALUE?tag.VALUE:"n/a"});

                    })
                    processAcctTags=true;



                }




                console.timeEnd()

            }
            if (processBalance && processSubInfo && processAcctTags){
                finalResult.balances= balanceResult;
                finalResult.general_acct=general_acct_info;
                finalResult.acct_tags=acct_tags;
                console.log(finalResult)

            }





        }


    } catch (e) {
        console.log(e)


    }

})();
