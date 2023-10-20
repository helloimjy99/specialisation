/** Definition of user profile modal
 *      Used to change password/email of current user
*/

import { style, VerifyCurrent } from '../Utility';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Logout from '../Logout';
import { GetToken, baseurl, config, UpdateOwnPassword, UpdateOwnEmail } from '../Utility';

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

function UserProfileModal(props) {

    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [modalStatus, setModalStatus] = useState("");

    function HandleInputPassword(event) {

        event.preventDefault();
        setPassword(event.target.value)

        //handle regex 
        if ((event.target.value === "") || (/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&$%^()-_+=;:'"<,>./`~])[A-Za-z\d@$!%*#?&$%^()-_+=;:'"<,>./`~]{8,10}$/).test(event.target.value)) {
            
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

        setPassword("");
        setEmail("");
    }

    const exitModal = () => {

        clearModal();
        setModalStatus("");
        props.setOpen(false);
    }

    async function SubmitEdit() {

        let errormesg = "";

        if (password !== "") {

            let pass_response = await UpdateOwnPassword(password);

            //console.log(password)

            if (!pass_response) {
                
                errormesg += "Update Password: Failed. \n"
            }

            if (pass_response && pass_response.error) {

                errormesg += pass_response.error + "\n";
            }
        }

        if (email && email !== "") {

            let email_response = await UpdateOwnEmail(email);

            if (!email_response) {
                
                errormesg += "Update Email: Failed. \n";
            }

            if (email_response && email_response.error) {

                errormesg += email_response.error + "\n";
            }
        }

        return errormesg;
    }

    async function SubmitEditCreate(event) {

        event.preventDefault();

        const verified = await VerifyCurrent();

        if (verified === false) {

            Logout(null, props.logout);
            return;
        }

        if (!event.target.checkValidity()) {

            setModalStatus("Invalid Input");
            return;
        }
        
        let result = await SubmitEdit();

        if (result) {

            setModalStatus("Account Update: Failed. \n" + result);
            alert("Account Update: Failed.");
        }
        else {

            setModalStatus("Account Update: Success.");
            //alert("Account Update Success");
            //exitModal();
            setPassword("");
        }
    }

    useEffect(() => {

        async function getUserInfo() {

            let verification = await VerifyCurrent();

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

                setPassword("");
                setEmail((response.data.groups[0].email) ? response.data.groups[0].email : "");
                
                return;
            }
            
            //response not expected
            return; 
        }

        getUserInfo();
    }, []);

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
                        Manage Profile
                    </Typography>
                    <IconButton sx={{float: "right"}} onClick={() => exitModal() }>
                        <CloseIcon/>
                    </IconButton>
                </Stack>
                
                {(modalStatus!=="") && <div style={{ color: 'red' }}>{modalStatus}</div>}
                <Container component="main" maxWidth="xs">
                    <CssBaseline />
                    <Box component="form" onSubmit={SubmitEditCreate} noValidate>

                        <TextField
                            margin="normal"
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

export default UserProfileModal;