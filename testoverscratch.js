const soapRequest = require("easy-soap-request");

const utils = require("./utils");
const parser = require('fast-xml-parser');
const moment = require("moment");
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


(async () => {
    try {

        const url_vQuery = "http://172.25.38.42:3005";
        const v_QueryHeaders = {
            'User-Agent': 'NodeApp',
            'Content-Type': 'text/xml;charset=UTF-8',
            'SOAPAction': 'urn:CCSVR1_QRY',
        };

        let serial = parseInt("0000022136").toString();
        console.log(serial);
        let txn_id = uuid.v4();
        let user = "EGH00047";
        let msisdn = "233255000102";


        let AMOUNT;
        let isCashTopUpSuccess = false;

        let xmlvoucher = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pi="http://xmlns.oracle.com/communications/ncc/2009/05/15/pi">
   <soapenv:Header/>
   <soapenv:Body>
      <pi:CCSVR1_QRY>
         <pi:username>admin</pi:username>
         <pi:password>admin</pi:password>
         <pi:PROVIDER>Surfline</pi:PROVIDER>
         <pi:SERIAL>${serial}</pi:SERIAL>
      </pi:CCSVR1_QRY>
   </soapenv:Body>
</soapenv:Envelope>`;


        const url_cashTop = "http://172.25.38.43:2222";
        const cashTopupHeaders = {

            'User-Agent': 'NodeApp',
            'Content-Type': 'text/xml;charset=UTF-8',
            'SOAPAction': 'http://172.25.39.13/wsdls/Surfline/CustomRecharge/CustomRecharge',
            'Authorization': 'Basic YWlhb3NkMDE6YWlhb3NkMDE=',

        };


        const {response} = await soapRequest({
            url: url_vQuery,
            headers: v_QueryHeaders,
            xml: xmlvoucher,
            timeout: 4000
        });
        const {headers, body, statusCode} = response;

        let jsonObj = parser.parse(body, options);
        if (jsonObj.Envelope.Body.CCSVR1_QRYResponse) {
            const soapResponseBody = jsonObj.Envelope.Body.CCSVR1_QRYResponse;

            const v_status = soapResponseBody.STATUS;
            const v_redeemed_date = soapResponseBody.REDEEMED_DATE;
            const balances = soapResponseBody.BALANCES.BALANCE_ITEM;


            if (v_status === 'A' && !v_redeemed_date) {
                balances.forEach(function (balance) {

                    if (balance.BALANCE_TYPE === "General Cash") {
                        AMOUNT = balance.AMOUNT;
                    }

                });

            } else {
                console.log("Voucher already used")
            }

        } else {
            let soapFault = jsonObj.Envelope.Body.Fault;
            let faultString = soapFault.faultstring;
            console.log(faultString)
        }


        if (AMOUNT) {
            const cashTopXML = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cas="http://SCLINSMSVM01T/wsdls/Surfline/CashTopUpOverscratch.wsdl">
   <soapenv:Header/>
   <soapenv:Body>
      <cas:CashTopUpOverscratchRequest>
         <CC_Calling_Party_Id>${msisdn}</CC_Calling_Party_Id>
         <Recharge_List_List>
            <Recharge_List>
               <Balance_Type_Name>General Cash</Balance_Type_Name>
               <Recharge_Amount>${AMOUNT}</Recharge_Amount>
               <Balance_Expiry_Extension_Period/>
               <Balance_Expiry_Extension_Policy/>
               <Bucket_Creation_Policy/>
               <Balance_Expiry_Extension_Type/>
            </Recharge_List>
         </Recharge_List_List>
         <CHANNEL>IN_Web</CHANNEL>
         <VOUCHER_SERIAL>${serial}</VOUCHER_SERIAL>
         <TRANSACTION_ID>${txn_id}</TRANSACTION_ID>
         <POS_USER>${user}</POS_USER>
      </cas:CashTopUpOverscratchRequest>
   </soapenv:Body>
</soapenv:Envelope>`;


            const {response} = await soapRequest({
                url: url_cashTop,
                headers: cashTopupHeaders,
                xml: cashTopXML,
                timeout: 4000
            });
            const {headers, body, statusCode} = response;
            let jsonObj = parser.parse(body, options);
            const soapResponseBody = jsonObj.Envelope.Body;

            if (!soapResponseBody.CashTopUpOverscratchRequest) {
                isCashTopUpSuccess = true;
            } else {
                let soapFault = jsonObj.Envelope.Body.Fault;
                let faultString = soapFault.faultstring;
                console.log(faultString);
            }


        }


        if (isCashTopUpSuccess) {

            let timestamp = moment().format("YYYY-MM-DD HH:mm:ss");

            const vFreezeXML = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pi="http://xmlns.oracle.com/communications/ncc/2009/05/15/pi">
   <soapenv:Header/>
   <soapenv:Body>
      <pi:CCSVR1_FRZ>
         <pi:username>admin</pi:username> 
         <pi:password>admin</pi:password>
         <pi:SERIAL>${serial}</pi:SERIAL>
         <pi:DESCRIPTION>${msisdn}|${timestamp}|${user}</pi:DESCRIPTION>
      </pi:CCSVR1_FRZ>
   </soapenv:Body>
</soapenv:Envelope>`;


            const {response} = await soapRequest({
                url: url_vQuery,
                headers: v_QueryHeaders,
                xml: vFreezeXML,
                timeout: 4000
            });
            const {headers, body, statusCode} = response;
            let jsonObj = parser.parse(body, options);
            const soapResponseBody = jsonObj.Envelope.Body.CCSVR1_FRZResponse.AUTH;
            if (soapResponseBody && soapResponseBody.length > 0) {
                console.log("Success")

            } else {
                console.log(jsonObj.Envelope.Body);
                let soapFault = jsonObj.Envelope.Body.Fault;
                let faultString = soapFault.faultstring;
                console.log(faultString)
            }

        }

    } catch (error) {
        let errorBody = error.toString();
        if (parser.validate(errorBody) === true){
            let jsonObj = parser.parse(errorBody, options);
            let soapFault = jsonObj.Envelope.Body.Fault;
            let faultString = soapFault.faultstring;
            console.log(faultString)

        }else {
            console.log(errorBody)
        }



    }

})()
