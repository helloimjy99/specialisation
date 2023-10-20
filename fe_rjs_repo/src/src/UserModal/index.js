/** Definition of user modal
 *      Used by both creation and editing of user
*/

import { style, VerifyAdminPerms } from '../Utility';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Logout from '../Logout';
import { GetToken, baseurl, config, UpdatePassword, UpdateEmail, UpdateStatus, UpdateGroups, CreateUser } from '../Utility';

import { Modal } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Chip from '@mui/material/Chip';

function UserModal(props) {

    const [userInfo, setUserInfo] = useState([]);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState(true);
    const [modalStatus, setModalStatus] = useState("");
    const [groups, setGroups] = useState([]);

    function HandleInputUsername(event) {

        event.preventDefault();
        setUsername(event.target.value);

        //handle regex 
        if ((/^([a-zA-Z0-9]){3,12}$/).test(event.target.value)) {
            
            event.target.setCustomValidity('');
            return;
        }

        event.target.reportValidity();
        event.target.setCustomValidity('Invalid/Missing Username: \nLength is 4 to 12 characters \nAlphanumeric only');
        return;
    }

    function HandleInputPassword(event) {

        event.preventDefault();
        setPassword(event.target.value)

        //handle regex 
        if ((props.userid && event.target.value === "") || (/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&$%^()-_+=;:'"<,>./`~])[A-Za-z\d@$!%*#?&$%^()-_+=;:'"<,>./`~]{8,10}$/).test(event.target.value)) {
            
            event.target.setCustomValidity('');
            return;
        }

        event.target.reportValidity();
        event.target.setCustomValidity('Invalid/Missing Password: \nLength is 8 to 10 characters \nAlphanumeric & Special Characters \nAt least 1 letter, 1 number, 1 special character');
        return;
    }

    function HandleInputEmail(event) {

        event.preventDefault();
        setEmail(event.target.value)

        //handle regex 
        if ((/^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/).test(event.target.value)
            || event.target.value === "") {
            
            event.target.setCustomValidity('');
            return;
        }

        event.target.reportValidity();
        event.target.setCustomValidity('Invalid Email Format');
        return;
    }

    const clearModal = () => {

        setUsername("");
        setPassword("");
        setEmail("");
        setStatus(true);
        resetGroupToggles();
    }

    const exitModal = () => {

        props.clearUserid("");
        clearModal();
        setModalStatus("");
        setGroups([]);
        props.refresh(true);
        props.setOpen(false);
    }

    function UpdateGroupToggles(groupname) {

        const copygroup = groups.slice();

        for (var i = 0; i < groups.length; ++i) {

            if (copygroup[i].name !== groupname)
                continue;

            copygroup[i].checked = !copygroup[i].checked;

            setGroups(copygroup);
            return;
        }
    }

    const resetGroupToggles = () => {

        const copygroup = groups.slice();

        for (var i = 0; i < groups.length; ++i) {

            if (copygroup[i].check === false)
                continue;

            copygroup[i].checked = false;
        }
        setGroups(copygroup);
        return;
    } 

    async function SubmitEdit() {

        let errormesg = "";

        if (password !== "") {

            let pass_response = await UpdatePassword(userInfo.username, password);

            //console.log(password)

            if (!pass_response) {
                
                errormesg += "Update Password: Failed. \n"
            }

            if (pass_response && pass_response.error) {

                errormesg += pass_response.error + "\n";
            }
        }

        const email_verify = (email === "") ? null : email;

        if (email_verify !== userInfo.email) {

            let email_response = await UpdateEmail(userInfo.username, email_verify);

            if (!email_response) {
                
                errormesg += "Update Email: Failed. \n";
            }

            if (email_response && email_response.error) {

                errormesg += email_response.error + "\n";
            }
        }

        if (status !== "" && status !== userInfo.user_status) {

            let status_response = await UpdateStatus(userInfo.username, ((status) ? 1 : 0));

            if (!status_response) {
                
                errormesg += "Update Status: Failed. \n";
            }

            if (status_response && status_response.error) {

                errormesg += status_response.error + "\n";
            }
        }

        //for group, format into string then compare with current user's
        if (groups) {

            let stringed_groups = ",";

            for (var i = 0; i < groups.length; ++i) {

                if (groups[i].checked) {

                    stringed_groups += groups[i].name + ",";
                }
            }

            //console.log(stringed_groups);

            if (stringed_groups === userInfo.usergroups) {

                return false;
            }

            if (stringed_groups === ",") {

                stringed_groups = null;
            }

            let group_response = await UpdateGroups(userInfo.username, stringed_groups);
            
            if (!group_response) {
                
                errormesg += "Update Groups: Failed. \n";
            }

            if (group_response && group_response.error) {

                errormesg += group_response.error + "\n";
            }
        }

        return (errormesg === "") ? null : errormesg;
    }

    async function SubmitCreate() {

        //assume all fields are valid
        let stringed_groups = ",";
        let errormesg = "";

        for (var i = 0; i < groups.length; ++i) {

            if (groups[i].checked) {

                stringed_groups += groups[i].name + ",";
            }
        }

        if (stringed_groups === ",") {

            stringed_groups = null;
        }

        let create_response = await CreateUser(username, password, email, stringed_groups);

        //console.log(create_response);

        if (create_response && create_response.error) {

            errormesg += create_response.error + "\n";
        }

        return (errormesg === "") ? null : errormesg;
    }

    async function SubmitEditCreate(event) {

        event.preventDefault();

        const verified = await VerifyAdminPerms();

        if (verified === false) {

            Logout(null, props.logout);
            return;
        }

        if (!event.target.checkValidity()) {

            setModalStatus("Invalid Input");
            return;
        }

        //console.log("submit");

        //console.log("button clicked");
        //use userid as choice to change type of request
        //null userid means creation since none passed in
        //valid userid means edit since existing user's id is passed in
        if (props.userid) {
            //console.log("updating account");
            //valid, update
            //split into multiple depending on case
            let result = await SubmitEdit();

            if (result) {

                setModalStatus("Account Update: Failed. \n" + result);
                alert("Account Update: Failed.");
            }
            else {

                setModalStatus("Account Update: Success.");
                //alert("Account Update Success");
                exitModal();
            }
        }
        else {

            let result = await SubmitCreate();

            if (result) {

                setModalStatus("Account Creation: Failed. \n" + result);
                alert("Account Creation: Failed.");
            }
            else {

                setModalStatus("Account Creation: Success.");
                //alert("Account Creation: Success.");
                clearModal();
            }
        }
    }

    useEffect(() => {

        async function VerifySessionAndAdmin() {
            
            const verified = await VerifyAdminPerms();
    
            if (verified === false) {
    
                return false;
            }
            return true;
        }

        async function getGroups(usergroups) {

            //passed in usergroups is of preformatted type 

            //to run in combo with getUserInfo
            //minimise checks needed since done by getUserInfo
            let token = GetToken();
            //let id = localStorage.getItem("id");
            
            let response;

            try {

                response = await axios.post(baseurl + '/groups',
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

            if (response && !response.data.error) {
            
                //console.log(response.data);
                //no error on return, valid
                //format response of groups into list for checkbox
                let group_setup = []
                for (var i = 0; i < response.data.groups.length; ++i) {

                    //console.log(response.data.groups[i].user_groups);

                    //check if group exists for user and preset value
                    let ingroup = ((usergroups && (usergroups.search("," + response.data.groups[i].user_groups + ",") !== -1)) 
                                    ? true
                                    : false);

                    group_setup.push({

                        name: response.data.groups[i].user_groups,
                        checked: ingroup
                    });
                }

                //console.log(group_setup);
                setGroups(group_setup);
                return true;
            }
            
            //response not expected
            return false; 
        }

        async function getUserInfo() {

            let verification = await VerifySessionAndAdmin();

            if (!verification) {

                Logout(null, props.logout);
                return;
            }
    
            let token = GetToken();
            //let id = localStorage.getItem("id");
            
            if (!token) {
            
                Logout(null, props.logout);
                //console.log("logging out");
                return;
            }
            
            let response;

            try {
            
                response = await axios.post(baseurl + '/users',
                    {
                    
                        //username: id,
                        tmptoken: token,
                        userid: props.userid
                    },
                    config
                );
            }
            catch (error) {

                //axios issue, likely no connection to server
                alert("An Error has occurred, please contact server administrator");
                return;
            }
            
            if (response && !response.data.error) {
            
                //console.log(response.data);
                //no error on return, valid
                setUserInfo(response.data.groups[0]);
                //console.log(userInfo);

                setUsername(response.data.groups[0].username);
                setPassword("");
                setEmail((response.data.groups[0].email) ? response.data.groups[0].email : "");
                setStatus((response.data.groups[0].user_status === 1) ? true : false);
                //console.log(users);

                //get groups to format group
                //pass in current user's group info
                let group_check = getGroups((response.data.groups[0].user_groups));
                
                return;
            }
            
            //response not expected
            //console.log("failed");
            return; 
        }

        if (props && props.userid) {
            
            //console.log("creating");
            getUserInfo();
        }
        else {

            getGroups("");
        }
    }, [props.userid]);

    /*return (
        <Modal 
            open={props.opened}
            onClose={exitModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                
                <Stack direction="row">
                    <Typography variant="h6" component="h6">
                        {(props.userid) ? "Edit " + props.userid : "Create New User"}
                    </Typography>
                    <IconButton onClick={() => exitModal() }>
                        <CloseIcon/>
                    </IconButton>
                </Stack>
                
                {(modalStatus!=="") && modalStatus}
                <form onSubmit={SubmitEditCreate}>
                    {(!props.userid) &&
                    <>           
                        <br/>
                        <label> Username: 
                            <br/>
                            <input
                                type="text"
                                value={username}
                                placeholder="Username"
                                onChange={(input_user) => HandleInputUsername(input_user)}
                                required={(!props.userid)}
                            >
                            </input>
                        </label>
                        <br/>
                    </>
                    }
                    <br/>
                    <label> {(!props.userid) ? "Password: " : "New Password (Optional)"}
                        <br/>
                        <input
                            type={'password'}
                            value={password}
                            placeholder={(!props.userid) ? "Password" : "Leave blank if not changing"}
                            onChange={(input_pass) => HandleInputPassword(input_pass)}
                            required={(!props.userid)}
                        >
                        </input>
                    </label>
                    <br/>
                    <br/>
                    <label> Email (Optional): 
                        <br/>
                        <input
                            type="email"
                            value={email}
                            placeholder={(!props.userid) ? "Email" : "Leave blank if not changing"}
                            onChange={(input_email) => HandleInputEmail(input_email)}
                        >
                        </input>
                    </label>
                    {(props.userid) &&
                    <>
                        <br/>
                        <br/>
                        <label>
                            Active Status: {"   "}
                            <input
                                type="checkbox"
                                onChange={() => setStatus(!status)}
                                checked={status}
                            />
                        </label>
                    </>
                    }
                    <br/>
                    <br/>
                    <label>
                        Groups (Optional):
                        <br/>
                        {groups && 

                            groups.map((item) => (

                                <li key={item.name}>
                                    {item.name}
                                    
                                    <input
                                        type="checkbox"
                                        onChange={() => UpdateGroupToggles(item.name)}
                                        checked={item.checked}
                                    />
                                </li>
                            ))
                        }
                    </label>
                    <br/>
                    <button type = "submit">Save</button>
                </form>
            </Box>
        </Modal>
    );*/
    return (
        <Modal 
            open={props.opened}
            onClose={exitModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                
                <Stack direction="row">
                    <Typography variant="h6" component="h6">
                        {(props.userid) ? "Edit " + props.userid : "Create New User"}
                    </Typography>
                    <IconButton sx={{float: "right"}} onClick={() => exitModal() }>
                        <CloseIcon/>
                    </IconButton>
                </Stack>
                
                {(modalStatus!=="") && <div style={{ color: 'red' }}>{modalStatus}</div>}
                <Container component="main" maxWidth="xs">
                    <CssBaseline />
                    <Box component="form" onSubmit={SubmitEditCreate} noValidate>
                        {(!props.userid) &&
                        <TextField
                            margin="normal"
                            required={(!props.userid)}
                            fullWidth
                            id="username"
                            label="Username"
                            value={username}
                            onChange={(input_user) => HandleInputUsername(input_user)}
                            autoFocus
                        />
                        }
                        <TextField
                            margin="normal"
                            required={(!props.userid)}
                            fullWidth
                            label="Password"
                            type="password"
                            id="password"
                            value={password}
                            placeholder={(!props.userid) ? "" : "Leave blank if not resetting"}
                            onChange={(input_pass) => HandleInputPassword(input_pass)}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Email (Optional)"
                            type="email"
                            id="email"
                            value={email}
                            onChange={(input_email) => HandleInputEmail(input_email)}
                        />
                        
                        <FormGroup>
                            <FormControlLabel 
                                control=
                                {
                                    <Checkbox
                                        margin="normal"
                                        id="status"
                                        onChange={() => setStatus(!status)}
                                        checked={status}
                                    />
                                } 
                                label="Active Status" 
                                labelPlacement="start"                      
                            />
                        </FormGroup>
                        
                        <label>
                        Groups (Optional):
                            <Box>
                                {groups && 

                                    groups.map((item) => (
                                        <Chip key={item.name}
                                            label={item.name} 
                                            variant="outlined" 
                                            color={(item.checked) ? "primary" : "default"} 
                                            onClick={() => UpdateGroupToggles(item.name)}
                                        />
                                    ))
                                }
                            </Box>
                        </label>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Save
                        </Button>
                    </Box>
                </Container>
            </Box>
        </Modal>
    );
}

export default UserModal;