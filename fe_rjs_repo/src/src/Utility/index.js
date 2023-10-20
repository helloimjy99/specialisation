/** Definitions of functions and objects used in other pages */

import axios from 'axios';
import Cookies from 'universal-cookie';

const cookies = new Cookies(null, { path: '/' });

let baseurl = process.env.REACT_APP_API_URL;

let config = {
  headers: 
  { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
  }
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  overflowY: "scroll", 
  maxHeight: "90%"
};

const grouplist_style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  overflowY: "scroll", 
  maxHeight: "90%"
};

/** Gets the token if locally available
 *    If present returns value
 *    If not present returns null
 */
function GetToken() {

  var token;

  try {

    token = cookies.get("tmptoken");
  }
  catch (e) {

    console.log(e);
    token = null;
  }

  return token;
}

/** Sets the token upon successful getting 
 *    Used after getting token from backend
*/
function SetToken(token) {

  cookies.set("tmptoken", token);
}

/** Clears the token
 *    Used when logging out
 */
function ClearToken() {

  cookies.remove("tmptoken");
}

/** Verify if local storage has token and id
 *    If present then check if still valid
 *    Returns bool value validating status
 */
async function VerifyCurrent() {

    //let token = GetToken();
    let token = cookies.get("tmptoken");
    //let id = localStorage.getItem("id");
    //console.log(token);
    
    if (!token) {
  
      localStorage.clear();
      ClearToken();
      //console.log("invalid");
      return false;
    }
  
    let response;

    try {

      response = await axios.post(baseurl + '/verify',
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
        return false;
    }
  
    if (response && !response.data.error) {
  
      //no error on return, valid
      return true;
    }
    //console.log(response);
    //response not expected, just false
    //console.log("fail");
    return false;
}

/** Verify if current user is of a specified group
 *    Assumes that user is already verified
 */
async function CheckGroup(groupname) {

  let token = GetToken();
  
  if (!token) {

    localStorage.clear();
    ClearToken();
    return false;
  }

  let response;

  try {

    response = await axios.post(baseurl + '/checkgroups',
        {
            tmptoken: token,
            groupname: groupname
        },
        config
    );
  }
  catch (error) {

      //axios issue, likely no connection to server
      alert("An Error has occurred, please contact server administrator");
      return false;
  }

  if (response && !response.data.error) {

    //no error on return, clean api response
    //console.log(response.data.response);
    return response.data.response;
  }
  //console.log(response);
  //response not expected, just false
  //console.log("fail");
  return false;
}

/** Verify if current user is of admin group
 *    Combines use of both VerifyCurrent and Checkgroup
 */
async function VerifyAdminPerms() {

  let verifyuser = await VerifyCurrent();

  if (!verifyuser)
    return false;

  let adminperms = await CheckGroup("admin");

  if (!adminperms)
    return false;

  return true;
}

/** Verify if current user is of ProjectLeader group
 *    Combines use of both VerifyCurrent and Checkgroup
 */
async function VerifyPLPerms() {

  let verifyuser = await VerifyCurrent();

  if (!verifyuser)
    return false;

  let plperms = await CheckGroup("ProjectLeader");

  if (!plperms)
    return false;

  return true;
}

/** Verify if current user is of ProjectManager group
 *    Combines use of both VerifyCurrent and Checkgroup
 */
async function VerifyPMPerms() {

  let verifyuser = await VerifyCurrent();

  if (!verifyuser)
    return false;

  let pmperms = await CheckGroup("ProjectManager");

  if (!pmperms)
    return false;

  return true;
}

/** Handles the updating of a specified user's password
 *    Assumes that the password is of the correct format by the form
*/
async function UpdatePassword(userid, password) {

  let verify = await VerifyAdminPerms();

  if (!verify) {

    //failed to verify for any reason, return false to deny
    return null;
  }

  let token = GetToken();
  //let id = localStorage.getItem("id");
  //console.log(token);
  
  if (!token) {

    localStorage.clear();
    ClearToken();
    //console.log("invalid");
    return null;
  }

  let response;

  try {

    response = await axios.post(baseurl + '/updatepassword',
        {
        
            //username: id,
            tmptoken: token,
            userid: userid,
            newpassword: password
        },
        config
    );
  }
  catch (error) {

      //axios issue, likely no connection to server
      alert("An Error has occurred, please contact server administrator");
      return null;
  }

  return response.data;
}

/** Handles the updating of a specified user's email
 *    Assumes that the email is of the correct format by the form
*/
async function UpdateEmail(userid, email) {

  let verify = await VerifyAdminPerms();

  if (!verify) {

    //failed to verify for any reason, return false to deny
    return null;
  }

  let token = GetToken();
  //let id = localStorage.getItem("id");
  //console.log(token);
  
  if (!token) {

    localStorage.clear();
    ClearToken();
    //console.log("invalid");
    return null;
  }

  let response;

  try {

    response = await axios.post(baseurl + '/updateemail',
        {
        
            //username: id,
            tmptoken: token,
            userid: userid,
            email: (email) ? email : null
        },
        config
    );
  }
  catch (error) {

      //axios issue, likely no connection to server
      alert("An Error has occurred, please contact server administrator");
      return null;
  }

  return response.data;
}

/** Handles the updating of own password
 *    Assumes that the password is of the correct format by the form
*/
async function UpdateOwnPassword(password) {

  let verify = await VerifyCurrent();

  if (!verify) {

    //failed to verify for any reason, return false to deny
    return null;
  }

  let token = GetToken();
  //let id = localStorage.getItem("id");
  //console.log(token);
  
  if (!token) {

    localStorage.clear();
    ClearToken();
    //console.log("invalid");
    return null;
  }

  let response;

  try {

    response = await axios.post(baseurl + '/updateownpassword',
        {
        
            //username: id,
            tmptoken: token,
            newpassword: password
        },
        config
    );
  }
  catch (error) {

      //axios issue, likely no connection to server
      alert("An Error has occurred, please contact server administrator");
      return null;
  }

  return response.data;
}

/** Handles the updating of a specified user's email
 *    Assumes that the email is of the correct format by the form
*/
async function UpdateOwnEmail(email) {

  let verify = await VerifyCurrent();

  if (!verify) {

    //failed to verify for any reason, return false to deny
    return null;
  }

  let token = GetToken();
  //let id = localStorage.getItem("id");
  //console.log(token);
  
  if (!token) {

    localStorage.clear();
    ClearToken();
    //console.log("invalid");
    return null;
  }

  let response;

  try {

    response = await axios.post(baseurl + '/updateownemail',
        {
        
            //username: id,
            tmptoken: token,
            email: (email) ? email : null
        },
        config
    );
  }
  catch (error) {

      //axios issue, likely no connection to server
      alert("An Error has occurred, please contact server administrator");
      return null;
  }

  return response.data;
}

/** Handles the updating of a specified user's status
 *    Assumes that the status is of the correct format by the form
*/
async function UpdateStatus(userid, status) {

  let verify = await VerifyAdminPerms();

  if (!verify) {

    //failed to verify for any reason, return false to deny
    return null;
  }

  let token = GetToken();
  //let id = localStorage.getItem("id");
  //console.log(token);
  
  if (!token) {

    localStorage.clear();
    ClearToken();
    //console.log("invalid");
    return null;
  }

  let response;

  try {

    response = await axios.post(baseurl + '/updatestatus',
        {
        
            //username: id,
            tmptoken: token,
            userid: userid,
            status: status
        },
        config
    );
  }
  catch (error) {

      //axios issue, likely no connection to server
      alert("An Error has occurred, please contact server administrator");
      return null;
  }

  return response.data;
}

/** Handles the updating of a specified user's groups
 *    Assumes that the status is of the correct format by the form
*/
async function UpdateGroups(userid, groups) {

  let verify = await VerifyAdminPerms();

  if (!verify) {

    //failed to verify for any reason, return false to deny
    return null;
  }

  let token = GetToken();
  //let id = localStorage.getItem("id");
  //console.log(token);
  
  if (!token) {

    localStorage.clear();
    ClearToken();
    //console.log("invalid");
    return null;
  }

  let response;

  try {

    response = await axios.post(baseurl + '/updategroups',
        {
        
            //username: id,
            tmptoken: token,
            userid: userid,
            groups: groups
        },
        config
    );
  }
  catch (error) {

      //axios issue, likely no connection to server
      alert("An Error has occurred, please contact server administrator");
      return;
  }

  return response.data;
}

/** Handles the updating of a specified user's groups
 *    Assumes that the status is of the correct format by the form
*/
async function CreateUser(userid, password, email, groups) {

  let verify = await VerifyAdminPerms();

  if (!verify) {

    //failed to verify for any reason, return false to deny
    return null;
  }

  let token = GetToken();
  //let id = localStorage.getItem("id");
  //console.log(token);
  
  if (!token) {

    localStorage.clear();
    ClearToken();
    //console.log("invalid");
    return null;
  }

  let response;

  try {

    response = await axios.post(baseurl + '/createuser',
        {
        
            //username: id,
            tmptoken: token,
            newuserid: userid,
            newgroups: groups,
            newemail: email,
            newpassword: password
        },
        config
    );
  }
  catch (error) {

      //axios issue, likely no connection to server
      alert("An Error has occurred, please contact server administrator");
      return null;
  }

  //let caller handle data
  return response.data;
}

/** Handles the creation of a new group */
async function CreateGroup(groupname) {

  let verify = await VerifyAdminPerms();

  if (!verify) {

    //failed to verify for any reason, return false to deny
    return "error";
  }

  let token = GetToken();
  //let id = localStorage.getItem("id");
  //console.log(token);
  
  if (!token) {

    localStorage.clear();
    ClearToken();
    //console.log("invalid");
    return "error";
  }

  let response;

  try {

    response = await axios.post(baseurl + '/creategroup',
        {
        
            //username: id,
            tmptoken: token,
            groupname: groupname
        },
        config
    );
  }
  catch (error) {

      //axios issue, likely no connection to server
      alert("An Error has occurred, please contact server administrator");
      return "error";
  }

  return response.data.error;
}

async function VerifyKanbanPerm(acronym, state) {

  //called after verification of valid user

  let token = GetToken();
  let getapp_result;

  try {

      getapp_result = await axios.post(baseurl + '/getapp',
          {
          
              tmptoken: token,
              acronym: acronym
          },
          config
      );
  }
  catch (error) {

      //console.log(error);
      return false;
  }

  if (getapp_result.data.error || getapp_result.data.app.length < 1) {

      return false;
  }

  let current_permit_check;

  switch(state) {

    case "Create": {

      current_permit_check = getapp_result.data.app.app_permit_create;
      break;
    }
    case "Open": {

      current_permit_check = getapp_result.data.app.app_permit_open;
      break;
    }
    case "ToDo":
    case "Todo": {

      current_permit_check = getapp_result.data.app.app_permit_todolist;
      break;
    }
    case "Doing": {

      current_permit_check = getapp_result.data.app.app_permit_doing;
      break;
    }
    case "Done": {

      current_permit_check = getapp_result.data.app.app_permit_done;
      break;
    }
    case "Closed": {

      //special case closed, able to view
      return false;
      break;
    }
    default: {

      current_permit_check = null;
    }
  }

  if (!current_permit_check) {

    return false;
  }

  return await CheckGroup(current_permit_check);
} 


export {
  GetToken,
  SetToken,
  ClearToken,
  VerifyCurrent,
  CheckGroup,
  baseurl,
  config,
  style,
  grouplist_style,
  VerifyAdminPerms,
  VerifyPLPerms,
  VerifyPMPerms,
  VerifyKanbanPerm,
  UpdatePassword,
  UpdateEmail,
  UpdateStatus,
  UpdateGroups,
  CreateUser,
  CreateGroup,
  UpdateOwnPassword,
  UpdateOwnEmail
}