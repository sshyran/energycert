import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';

// TODO API calls here
//

@Injectable()
export class XtechService {

  apiRoot: string  = "https://wallet.staging.payxapi.com/apiv2/wallet/";
  backendURL: string = "http://localhost:4000/api/v1/users";


  userProfile: any = {};

  constructor(private http: Http) { }

/*
  makeHeader(signature: string ){
       //'api-key':??
    let headers = {
          'accept': 'application/json',
  				'x-sign': signature.toUpperCase(),
  				'host': 'https://unikrn.staging.payxapi.com/apiv1:4337',
  				'content-type': 'application/x-www-form-urlencoded'}
  	return headers

  }
*/

/*
  signing( secret_key: string = "qcW19trrbO2SrKLsT30JbvY6IZMeFlow") : string
{
 var crypto = require('crypto'),
    querystring = require('querystring'),
    signer = crypto.createHmac('sha256',
       new Buffer('qcW19trrbO2SrKLsT30JbvY6IZMeFlow', 'utf8')),
    postData = querystring.stringify({
        time: 1489846903,
        api_key: 'BrmMGclWxjAij1TFHeNwqKSsbo51wc2F',
        moredata: 'data'
    });
    var signature = signer.update(postData).digest('hex').toUpperCase();

    return signature

}
*/

  getTransactionsStatus(userId : string = "51287e29-5601-454f-a0c5-0b542e868af1",wallet_uuid : string = "")
  {
    // POST /gettrx
    let url : string= `${this.apiRoot}/gettrx`;
    this.http.post(url, {uuid: userId}) //TODO add wallet_uuid
    .subscribe(res => {console.log(res.json()); },
               error => { console.log("Error Message: " + error)}); //TODO take last array ???
  }


  getUsersAmount(publicKey)
  {
    // call POST /getwallet in the backend
    return this.http.post(this.backendURL+"/amount", {publicKey: publicKey})
  }

  test() {
    //this.signing();
    //  this.getUserProfile();

    //this.getUsersAmount();

  }
}
