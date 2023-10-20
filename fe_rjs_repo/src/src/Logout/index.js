/** Definition for logout functionality 
 *      Provides logout function for use on all pages
*/

import axios from 'axios';
import { GetToken, ClearToken, baseurl, config } from '../Utility';

import Cookies from 'universal-cookie';

const cookies = new Cookies(null, { path: '/' });

async function Logout(event, logout) {

    if (event != null)
        event.preventDefault();

    //console.log("triggered");

    let token = GetToken();
    //let id = localStorage.getItem("id");
  
    if (!token) {
  
      localStorage.clear();
      ClearToken();

      logout(false);
      return;
    }
  
    let response;

    localStorage.clear();
    ClearToken();

    try {

        response = await axios.post(baseurl + '/log_out',
            {
            
                //username: id,
                tmptoken: token
            },
            config
        );
    }
    catch (error) {

        //axios issue, likely no connection to server
        alert("An Error has occurred, please contact server administrator");
        return;
    }

    logout(false);
}

export default Logout;
