const soapRequest = require("easy-soap-request");
const parser = require('fast-xml-parser');
const he = require('he');
const uuid = require("uuid");


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


const url = "http://172.25.39.16:2222";

const sampleHeaders = {
    'User-Agent': 'NodeApp',
    'Content-Type': 'text/xml;charset=UTF-8',
    'SOAPAction': 'http://SCLINSMSVM01P/wsdls/Surfline/DATA_Recharges/DATA_Recharges',
    'Authorization': 'Basic YWlhb3NkMDE6YWlhb3NkMDE='
};


let msisdn = "233255000102";
let txn_id = uuid.v4();
let bundleId = "1.5gbs";
let user = "EGH00047";
let subscriptionType = "One-Off";


let xmlRequest = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:data="http://SCLINSMSVM01P/wsdls/Surfline/DATA_Recharges.wsdl">
   <soapenv:Header/>
   <soapenv:Body>
      <data:DATA_RechargesRequest>
         <CC_Calling_Party_Id>${msisdn}</CC_Calling_Party_Id>
         <CHANNEL>TEST</CHANNEL>
         <TRANSACTION_ID>${txn_id}</TRANSACTION_ID>
         <BundleName>${bundleId}</BundleName>
         <SubscriptionType>${subscriptionType}</SubscriptionType>
         <POS_USER>${user}</POS_USER>
      </data:DATA_RechargesRequest>
   </soapenv:Body>
</soapenv:Envelope>`;


(async () => {
    console.time();
    try {
        const {response} = await soapRequest({url: url, headers: sampleHeaders, xml: xmlRequest, timeout: 3000}); // Optional timeout parameter(milliseconds)

        const {body} = response;
        if (body.includes("DATA_RechargesResult")){

        }



    } catch (e) {
        let body = e.toString();
        console.log(body)
        if (body.includes("faultcode")) {
            let regex = /errorCode>(.+)<\//
            let match = regex.exec(body);
            switch (match){
                case "55":
                    console.log("Account has insuffcient cash balance");

            }

            console.timeEnd();
        }

    }

})();


