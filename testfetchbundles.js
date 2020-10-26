const soapRequest = require("easy-soap-request");
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


const url = "http://172.25.39.16:2222";
const sampleHeaders = {
    'User-Agent': 'NodeApp',
    'Content-Type': 'text/xml;charset=UTF-8',
    'SOAPAction': 'http://SCLINSMSVM01P/wsdls/Surfline/VoucherRecharge_USSD/VoucherRecharge_USSD',
    'Authorization': 'Basic YWlhb3NkMDE6YWlhb3NkMDE='
};

let xmlRequest=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pac="http://SCLINSMSVM01P/wsdls/Surfline/Package_Query_USSD.wsdl">
   <soapenv:Header/>
   <soapenv:Body>
      <pac:PackageQueryUSSDRequest>
         <CC_Calling_Party_Id>233255000102</CC_Calling_Party_Id>
      </pac:PackageQueryUSSDRequest>
   </soapenv:Body>
</soapenv:Envelope>`;

(async () => {
    console.time();
    try {
        const {response} = await soapRequest({url: url, headers: sampleHeaders, xml: xmlRequest, timeout: 3000}); // Optional timeout parameter(milliseconds)

        const {body} = response;

        if (body.includes("faultcode")) {
            const errorInfo = {};
            let regex = /errorCode>(.+)<\//
            let match = regex.exec(body);
            console.log(match[1])

            console.timeEnd();
        }

         else if (parser.validate(body) === true) { //optional (it'll return an object in case it's not valid)
            let jsonObj = parser.parse(body, options);
            let result = jsonObj.Envelope.Body;
            let packages = result.PackageQueryUSSDResult;


            const categoriesSet = new Set();
            const bundleEl_Value_Array = [];

            let resultEl_value;

            for (const [k, v ]of Object.entries(packages)) {

                if (k.startsWith("bundle")){
                    let regex = /(.+?)\|/
                    let match = regex.exec(v.toString());
                    categoriesSet.add(match[1]);
                    bundleEl_Value_Array.push(v.toString())

                }else if (k.startsWith("Result")){
                    resultEl_value = v.toString();

                }


            }

            if (categoriesSet.size >0 && bundleEl_Value_Array.length >0){
                const final_bundles=[];
                let catArray = [... categoriesSet];
                for (let i = 0; i < catArray.length; i++) {
                    let catValue = catArray[i];
                    let catObject ={};
                    catObject.name=catValue;
                    catObject.active=i===0?"active":"";
                    catObject.id="cat-"+i;
                    catObject.bundles=[];
                    for (let j = 0; j < bundleEl_Value_Array.length; j++) {
                        if (bundleEl_Value_Array[j].startsWith(catValue)){
                            let tempStringArray = bundleEl_Value_Array[j].split("|");
                            let bundleDetails = tempStringArray[1];
                            let bundleId = tempStringArray[2];
                            let periodicity = tempStringArray[3];
                            let bundleDetailtemp =  bundleDetails.split(/\s@|\s\//g);
                            let dataValue = bundleDetailtemp[0];
                            let price = bundleDetailtemp[1]; price=price.substring(3)
                            let validity = parseInt(bundleDetailtemp[2]);
                            let validity_period;
                            if (/hrs/ig.test(validity.toString())) {
                                validity_period ="hrs";
                            }else {
                                validity_period="days";
                            }
                            validity = `${validity} ${validity_period}`;

                            catObject.bundles.push(
                                {bundle_name:dataValue,
                                    price:price,
                                    validity:validity,
                                    bundleId:bundleId,
                                    one_off:"One-Off",
                                    recurrent:periodicity>1?"Recurrent":""
                                });
                        }

                    }
                    final_bundles.push({
                        category:catObject
                    })

                }
                for (const bundles of final_bundles) {
                    console.log(bundles.category)

                }

            }
            else{
                console.log(resultEl_value)

            }

            console.timeEnd()
        }

    } catch (e) {
        console.log(e)

    }

})();
