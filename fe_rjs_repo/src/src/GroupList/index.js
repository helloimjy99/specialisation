/** Definition of group list modal */

import '../App.css';
import { React, useEffect, useState } from 'react';
import Logout from '../Logout';
import { GetToken, config, baseurl, grouplist_style, VerifyAdminPerms } from '../Utility';
import axios from 'axios';
import GroupModal from '../GroupModal';

import { Modal } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHeadmui from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';

function GroupList(props) {

    const [groups, setGroups] = useState([]);
    const [refresh, setRefresh] = useState(true);
    const [openGroupModal, setOpenGroupModal] = useState(false);

    function HandleExitModal() {

        props.setOpen(false);
        props.userRefresh(true);
    }

    async function HandleOpenGroupModal() {

        const verified = await VerifyAdminPerms();
    
        if (verified === false) {

            Logout(null, props.logout);
            return;
        }

        setOpenGroupModal(true);
    }

    useEffect(() => {

        const getGroups = async () => {

            const verified = await VerifyAdminPerms();
    
            if (verified === false) {
    
                Logout(null, props.logout);
                return;
            }
    
            let token = GetToken();
            //let id = localStorage.getItem("id");
            
            if (!token) {
            
                Logout(null, props.logout);
                return;
            }
            
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
            
                //no error on return, valid
                setGroups(response.data.groups);
                return;
            }
            
            //response not expected
            return; 
        }

        if (refresh) {
            
            getGroups();
        }

        setRefresh(false);
    }, [refresh]);

    return (

        <Modal
            open={props.opened}
            onClose={HandleExitModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={grouplist_style}>
                <Stack direction="row">
                    <Typography variant="h6" component="h6">
                        Groups
                    </Typography>
                    <IconButton onClick={() => HandleExitModal() }>
                        <CloseIcon/>
                    </IconButton>
                </Stack>
                <IconButton onClick={() => HandleOpenGroupModal() }>
                    <AddIcon/>
                </IconButton>
                <GroupModal opened={openGroupModal} setOpen={setOpenGroupModal} refresh={setRefresh} logout={props.logout}/>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 100 }} size="small" aria-label="a dense table">
                        <TableHeadmui>
                            <TableRow>
                                <TableCell>Groups</TableCell>
                            </TableRow>
                        </TableHeadmui>
                        <TableBody>
                            {groups.map((item) => (
                                <TableRow  key={item.user_groups}>
                                    <TableCell>{item.user_groups}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Modal>
    )
}

export default GroupList;