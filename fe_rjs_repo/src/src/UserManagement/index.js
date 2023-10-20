/** Definition for user management page*/

import '../App.css';
import { React, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logout from '../Logout';
import { GetToken, config, baseurl, VerifyAdminPerms } from '../Utility';
import axios from 'axios';
import UserModal from '../UserModal';
import GroupList from '../GroupList';

import Button from '@mui/material/Button';
import { Grid, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHeadmui from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';

function UserManagement(props) {
    
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [refresh, setRefresh] = useState(true);
    const [currentUser, setCurrentUser] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [openGroupList, setOpenGroupList] = useState(false);

    const navigate = useNavigate();

    const defaultTheme = createTheme();

    const HandleOpenGroupListModal = async () => {
        
        let verify = await VerifyAdminPerms();

        if (!verify) {

            HandleLogout(null);
            return;
        }

        setOpenGroupList(true);
    }

    const setOpenEditUserModal = async (userid) => {

        let verify = await VerifyAdminPerms();

        if (!verify) {

            HandleLogout(null);
            return;
        }

        setCurrentUser(userid);
        setOpenModal(true);
    };

    function HandleLogout(event) {
    
        Logout(event, props.logout);
    }

    const BeautifyGroupList = (groupstring) => {

        let grouplist = [];

        if (!groupstring) {
         
            return "-";
        }

        for (var i = 0; i < groups.length; ++i) {

            if ((groupstring.search("," + groups[i].user_groups + ",") !== -1)) {

                //let groupchip = <Chip label="Chip Outlined" variant="outlined"> {groups[i].user_groups} </Chip>;
                let groupchip = groups[i].user_groups;

                grouplist.push(groupchip);
            }
        }

        //console.log(grouplist);

        if (grouplist.length < 1) {

            return "-";
        }

        return (

            grouplist.map((group) => (
                <Chip key={group} label={group} variant="outlined" />
            ))
        );
    }

    useEffect(() => {

        const getUsers = async() => {

            //console.log("getting users");
            const verified = await VerifyAdminPerms();
    
            if (verified === false) {
    
                //console.log("not verified");
                Logout(null, props.logout);
                //console.log("logging out");
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
                setUsers(response.data.groups);
                //console.log(users);
                return;
            }
            
            //response not expected
            return; 
        }

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
            getUsers();
        }

        document.title ="User Management | TMS"
        setRefresh(false);
    }, [refresh]);
    
    return (
        <div>
            <ThemeProvider theme={defaultTheme}>
                <CssBaseline/>
                <Grid
                    align="left"
                >
                    <Stack direction="row" spacing={2}>
                        <Typography variant="h5" component="h5">
                            User Management
                        </Typography>

                        <Button variant="contained" onClick={() => navigate("/home")}>Home</Button>
                        <Button variant="contained" onClick={HandleLogout}>Logout</Button>
                    </Stack>
                </Grid>
                <br/>
                <Stack direction="row" spacing={2}>
                        <Button variant="contained" onClick={() => HandleOpenGroupListModal()}>View Groups</Button>
                        <Button variant="contained" onClick={() => setOpenEditUserModal(null)}>Create New User</Button>

                </Stack>
                <br/>
                <GroupList opened={openGroupList} setOpen={setOpenGroupList} logout={props.logout} userRefresh={setRefresh}/>
                <UserModal opened={openModal} setOpen={setOpenModal} userid={currentUser} clearUserid={setCurrentUser} logout={props.logout} refresh={setRefresh}/>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                        <TableHeadmui>
                            <TableRow>
                                <TableCell>Username</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Groups</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHeadmui>
                        
                        <TableBody>
                            {users.map((item) => (
                                <TableRow  key={item.username}>
                                    <TableCell scope="row">{item.username}</TableCell>
                                    <TableCell>{(item.email) ? item.email : "-"}</TableCell>
                                    <TableCell>{(item.user_status === 1) ? <div style={{ color: 'green' }}>Active</div> : <div style={{ color: 'red' }}>Disabled</div>}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            {BeautifyGroupList(item.user_groups)}
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <IconButton variant="outlined" onClick={() => setOpenEditUserModal(item.username)}>
                                            <EditIcon/>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </ThemeProvider>
        </div>
    )
};

export default UserManagement;