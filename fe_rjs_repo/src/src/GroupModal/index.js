/** Definition for group modal */

import { useState, useEffect } from 'react';
import { style, CreateGroup, VerifyAdminPerms } from '../Utility';
import Logout from '../Logout';

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

function GroupModal(props) {

    const [groupName, setGroupName] = useState("");
    const [modalStatus, setModalStatus] = useState("");


    function HandleInputGroupname(event) {

        event.preventDefault();
        setGroupName(event.target.value);

        //handle regex 
        if ((/^([a-zA-Z0-9]){4,50}$/).test(event.target.value)) {
            
            event.target.setCustomValidity('');
            return;
        }

        event.target.reportValidity();
        event.target.setCustomValidity('Invalid/Missing Group Name: \nLength is 4 to 50 characters \nAlphanumeric only');
        return;
    }

    const clearModal = () => {

        setGroupName("");
        props.refresh(true);
    }

    const exitModal = () => {

        setModalStatus("");
        clearModal();
        props.setOpen(false);
    }

    async function SubmitGroup() {

        let create_response = await CreateGroup(groupName);
        
        if (create_response) {

            return false;
        }

        return true;
    }

    async function HandleSubmitGroup(event) {

        event.preventDefault();

        if (!event.target.checkValidity()) {

            setModalStatus("Invalid Input");
            return;
        }

        const verified = await VerifyAdminPerms();

        if (verified === false) {

            Logout(null, props.logout);
            return false;
        }
        
        let group_response = await SubmitGroup();

        //console.log(group_response);

        if (!group_response) {

            setModalStatus("Group name in use");
            alert("Failed to Create Group");
            return;
        }

        setModalStatus("Successfully Created Group");
        clearModal();
    }

    useEffect(() => {

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
                        Create New Group
                    </Typography>
                    <IconButton onClick={() => exitModal() }>
                        <CloseIcon/>
                    </IconButton>
                </Stack>
                {(modalStatus!=="") && <div style={{ color: 'red' }}>{modalStatus}</div>}
                <Container component="main" maxWidth="xs">
                    <CssBaseline />
                    <Box component="form" onSubmit={HandleSubmitGroup} noValidate>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="groupname"
                            label="Group Name"
                            value={groupName}
                            onChange={(input_name) => HandleInputGroupname(input_name)}
                            autoFocus
                        />
                        
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Create
                        </Button>
                    </Box>
                </Container>
            </Box>
        </Modal>
    );
}

export default GroupModal;