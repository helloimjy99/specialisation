/** Definition for home page*/

import '../App.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logout from '../Logout';
import UserProfileModal from '../UserProfileModal';
import AppModal from '../AppModal';
import { GetToken, baseurl, config, CheckGroup, VerifyAdminPerms, VerifyCurrent, VerifyPLPerms } from '../Utility';

import Button from '@mui/material/Button';
import { Grid, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHeadmui from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import EditIcon from '@mui/icons-material/Edit';
import NoteIcon from '@mui/icons-material/Note';
import IconButton from '@mui/material/IconButton';
import TextareaAutosize from '@mui/material/TextareaAutosize';

function Home(props) {
    
    const [admin, setAdmin] = useState(false);
    const [PL, setPL] = useState(false);
    const [profile, setProfile] = useState(false);
    const [refresh, setRefresh] = useState(true);
    const [applications, setApplications] = useState([]);
    const [currentapplication, setCurrentapplication] = useState("");
    const [app, setApp] = useState(false);
    

    const navigate = useNavigate();

    const defaultTheme = createTheme();

    async function HandleManageProfile() {

        let verify = await VerifyCurrent();

        if (!verify) {

            HandleLogout(null);
            return;
        }

        setProfile(true);
    }

    function HandleLogout(event) {
    
        Logout(event, props.logout);
    }

    async function HandleNavigateToManageUsers() {

        let verify = await VerifyAdminPerms();

        if (verify) {
            
            navigate("/manageusers");
            return;
        }

        setAdmin(false);
        Logout(null, props.logout);
    }

    async function HandleOpenAppModal(acronym) {

        let verify = await VerifyPLPerms();

        if (!verify) {

            Logout(null, props.logout);
            return;
        }

        //console.log("setting modal open");
        setCurrentapplication(acronym);
        setApp(true);
    }

    async function HandleNavigateToKanban(acronym) {

        let verify = await VerifyCurrent();

        if (!verify) {

            Logout(null, props.logout);
            return;
        }

        props.setAcronym(acronym);
        navigate("/board");
    }

    function ButtonGoToUserManagement() {

        if (admin) {
            
            //console.log(admin);
            return <Button variant="contained" onClick={HandleNavigateToManageUsers}>User Management</Button>;
        }
    }

    function ButtonOpenCreateAppModal() {

        if (PL) {

            return <Button variant="contained" onClick={() => HandleOpenAppModal("")}>Create Application</Button>
        }
    }

    const getAdmin = async() => {

        const response = await CheckGroup("admin");
        setAdmin(response);
    }

    const getPL = async() => {

        const response = await CheckGroup("ProjectLeader");
        setPL(response);
    }

    let getApplications = async() => {

        let response = null;
        
        try {

            response = await axios.post(baseurl + '/getapps',
                {
                
                    //username: id,
                    tmptoken: GetToken()
                },
                config
            );
        }
        catch (error) {

            //console.log(error);
        }

        //console.log(response);
        if (!response || response.error) {

            return;
        }

        setApplications(response.data.apps);
    }

    useEffect(() => {
        
        document.title ="Home | TMS"
        
        if (refresh) {
            
            getAdmin();
            getPL();
            getApplications();
            setRefresh(false);
        }
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
                            Homepage
                        </Typography>

                        <ButtonGoToUserManagement/>
                        <Button variant="contained" onClick={() => HandleManageProfile()}>Profile</Button>
                        <Button variant="contained" onClick={HandleLogout}>Logout</Button>
                    </Stack>
                </Grid>
                <UserProfileModal logout={props.logout} opened={profile} setOpen={setProfile}/>
                <br/>
                Applications
                <br/>
                <ButtonOpenCreateAppModal/>
                {PL &&
                    <AppModal logout={props.logout} refresh={setRefresh} opened={app} setOpen={setApp} acronym={currentapplication} setAcronym={setCurrentapplication}/>
                }
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                        <TableHeadmui>
                            <TableRow>
                                <TableCell>Acronym</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Start Date</TableCell>
                                <TableCell>End Date</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHeadmui>
                        
                        <TableBody>
                            {applications.map((item) => (
                                <TableRow key={item.app_acronym}>
                                    <TableCell scope="row">{item.app_acronym}</TableCell>
                                    <TableCell>
                                        <TextareaAutosize
                                            margin="normal"
                                            minRows={3}
                                            maxRows={10}
                                            style={{ width: "100%" }}
                                            value={item.app_description}
                                            disabled={true}
                                        />
                                    </TableCell>
                                    <TableCell>{(item.app_startdate) ? item.app_startdate : "-"}</TableCell>
                                    <TableCell>{(item.app_enddate) ? item.app_enddate : "-"}</TableCell>
                                    <TableCell>
                                        <Stack direction="row">
                                            {PL &&
                                            <IconButton variant="outlined" onClick={() => HandleOpenAppModal(item.app_acronym)}>
                                                <EditIcon/>
                                            </IconButton>
                                            }
                                            <IconButton variant="outlined" onClick={() => HandleNavigateToKanban(item.app_acronym)}>
                                                <NoteIcon/>
                                            </IconButton>
                                        </Stack>
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

export default Home;