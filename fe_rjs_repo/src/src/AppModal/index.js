/** Definition of Application modal 
 *      Used to both create and edit an application
 */
import { GetToken, grouplist_style, style, VerifyPLPerms } from '../Utility';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Logout from '../Logout';
import { baseurl, config } from '../Utility';

import { Modal } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import TextareaAutosize from '@mui/base/TextareaAutosize';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

function AppModal(props) {

    var customParseFormat = require('dayjs/plugin/customParseFormat');
    dayjs.extend(customParseFormat);
    
    const [acronym, setAcronym] = useState("");
    const [description, setDescription] = useState("");
    const [rnum, setRnum] = useState(0);
    const [startdate, setStartdate] = useState(null);
    const [enddate, setEnddate] = useState(null);
    const [openpermit, setOpenPermit] = useState("");
    const [todopermit, setTodoPermit] = useState("");
    const [doingpermit, setDoingPermit] = useState("");
    const [donepermit, setDonePermit] = useState("");
    const [createpermit, setCreatePermit] = useState("");
    const [modalStatus, setModalStatus] = useState("");

    const [groups, setGroups] = useState([]);

    const clearModal = () => {

        setAcronym("");
        setDescription("");
        setRnum(0);
        setStartdate(null);
        setEnddate(null);
        setOpenPermit("");
        setTodoPermit("");
        setDoingPermit("");
        setDonePermit("");
        setCreatePermit("");
    }

    const exitModal = () => {

        props.setAcronym("");
        clearModal();
        setModalStatus("");
        props.refresh(true);
        props.setOpen(false);
    }

    async function HandleInputAcronym(event) {

        event.preventDefault();
        setAcronym(event.target.value);

        if (event.target.value !== "") {
            
            event.target.setCustomValidity('');
            return;
        }

        event.target.reportValidity();
        event.target.setCustomValidity('Empty Application Acronym not allowed');
        return;
    }

    async function HandleInputDesc(event) {

        event.preventDefault();
        setDescription(event.target.value);
    }

    async function HandleInputRNumber(event) {

        event.preventDefault();
        setRnum(event.target.value);

        if (event.target.value > -1 && (/^([0-9])*$/).test(event.target.value) ) {
            
            event.target.setCustomValidity('');
            return;
        }

        event.target.reportValidity();
        event.target.setCustomValidity('Non zero number not allowed');
        return;
    }

    async function HandleSubmitCreate() {

        let startDate = (startdate) ? dayjs(startdate.$d).format("DD-MM-YYYY") : null;
        let endDate = (enddate) ? dayjs(enddate.$d).format("DD-MM-YYYY") : null;

        let createapp_result;
        try {

            createapp_result = await axios.post(baseurl + '/createapp',
                {
                
                    tmptoken: GetToken(),
                    acronym: acronym,
                    description: description,
                    rnumber: rnum,
                    start_date: startDate,
                    end_date: endDate,
                    permit_open: openpermit,
                    permit_todo: todopermit,
                    permit_doing: doingpermit,
                    permit_done: donepermit,
                    permit_create: createpermit
                },
                config
            );
        }
        catch (error) {

            //console.log(error);
            return false;
        }

        if (createapp_result.data.error) {

            return false;
        }

        return true
    }

    async function HandleSubmitEdit() {
        
        let startDate = (startdate) ? dayjs(startdate.$d).format("DD-MM-YYYY") : null;
        let endDate = (enddate) ? dayjs(enddate.$d).format("DD-MM-YYYY") : null;
        let editapp_result;
        try {

            editapp_result = await axios.post(baseurl + '/editapp',
                {
                
                    tmptoken: GetToken(),
                    acronym: acronym,
                    description: description,
                    start_date: startDate,
                    end_date: endDate,
                    permit_open: openpermit,
                    permit_todo: todopermit,
                    permit_doing: doingpermit,
                    permit_done: donepermit,
                    permit_create: createpermit
                },
                config
            );
        }
        catch (error) {

            //console.log(error);
            return false;
        }

        return true
    }

    async function HandleSubmit(event) {

        event.preventDefault();

        if (!event.target.checkValidity()) {
            
            alert("Invalid Input");
            setModalStatus("Invalid Input");
            return;
        }

        let verify = await VerifyPLPerms();

        if (!verify) {

            Logout(null, props.logout);
            return;
        }

        if (!props.acronym) {

            let result = await HandleSubmitCreate();

            if (result) {

                alert("Application created");
                clearModal();
                props.refresh(true);
            }
            else {

                alert("Failed to create Application");
            }
        }
        else {

            let result = await HandleSubmitEdit();

            if (result) {

                alert("Application edited");
                props.refresh(true);
                exitModal();
            }
            else {

                alert("Failed to edit Application");
                setModalStatus("Failed to edit Application");
            }
        }
    }

    useEffect(() => {

        async function getGroups() {

            let verify = await VerifyPLPerms();

            if (!verify) {

                Logout(null, props.logout);
                return false;
            }

            let token = GetToken();
            let response;

            try {

                response = await axios.post(baseurl + '/groups',
                    {
                    
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
                setGroups(response.data.groups);

                return true;
            }
            
            //response not expected
            return false; 
        }

        getGroups();
    }, [props.opened])

    useEffect(() => {
        async function getApp() {

            let verify = await VerifyPLPerms();

            if (!verify) {

                Logout(null, props.logout);
                return false;
            }

            let token = GetToken();
            
            let getapp_result;

            try {

                getapp_result = await axios.post(baseurl + '/getapp',
                    {
                    
                        tmptoken: token,
                        acronym: props.acronym
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

            let app = getapp_result.data.app;
            setAcronym(props.acronym);
            setDescription((app.app_description) ? app.app_description : "");
            setRnum(app.app_rnumber);
            setStartdate((app.app_startdate) ? (dayjs(app.app_startdate, "DD-MM-YYYY")) : app.app_startdate);
            setEnddate((app.app_enddate) ? (dayjs(app.app_enddate, "DD-MM-YYYY")) : app.app_enddate);
            setOpenPermit((app.app_permit_open) ? app.app_permit_open : "");
            setTodoPermit((app.app_permit_todolist) ? app.app_permit_todolist : "");
            setDoingPermit((app.app_permit_doing) ? app.app_permit_doing : "");
            setDonePermit((app.app_permit_done) ? app.app_permit_done : "");
            setCreatePermit((app.app_permit_create) ? app.app_permit_create : "");
            //console.log(app);

            return true;
        }

        if (props.acronym) {

            //get application specific info
            getApp();
        }
    }, [props.acronym])
    
    return (
        <Modal 
            open={props.opened}
            onClose={exitModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={grouplist_style}>
                
                <Stack direction="row">
                    <Typography variant="h6" component="h6">
                        {(props.acronym) ? "Edit " + props.acronym : "Create New Application"}
                    </Typography>
                    <IconButton sx={{float: "right"}} onClick={() => exitModal() }>
                        <CloseIcon/>
                    </IconButton>
                </Stack>
                
                {(modalStatus!=="") && <div style={{ color: 'red' }}>{modalStatus}</div>}
                <Container component="main" maxWidth="xs">
                    <CssBaseline />
                    <Box component="form" onSubmit={HandleSubmit} noValidate>
                        {(!props.acronym) &&
                        <>
                            <label>Acronym</label>
                            <TextField
                                margin="normal"
                                required={(!props.acronym)}
                                fullWidth
                                id="acronym"
                                value={acronym}
                                onChange={(input_acronym) => HandleInputAcronym(input_acronym)}
                                autoFocus={(!props.acronym)}
                            />
                        </>
                        }
                        <label>Description</label>
                        <TextareaAutosize
                            margin="normal"
                            minRows={9}
                            maxRows={20}
                            style={{ width: "100%" }}
                            label="Description"
                            id="description"
                            value={description}
                            onChange={(input_desc) => HandleInputDesc(input_desc)}
                        />

                        <label>Running Number</label>
                        <br/>
                        <input
                            type="number"
                            step={1}
                            min={0} 
                            label="Running Number"
                            value={rnum}
                            onChange={(e) => HandleInputRNumber(e)}
                            disabled={(props.acronym)}
                        />
                        <br/>
                        <br/>
                        <Stack direction="row">
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker 
                                    value={startdate}
                                    onChange={(e) => { setStartdate(e)}}
                                    label="Start Date"
                                    format="DD/MM/YYYY"
                                    //defaultValue={dayjs(new Date().toLocaleDateString())}
                                />
                            </LocalizationProvider>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker 
                                    value={enddate}
                                    onChange={(e) => { setEnddate(e)}}
                                    label="End Date"
                                    format="DD/MM/YYYY"
                                    //defaultValue={dayjs(new Date().toLocaleDateString())}
                                />
                            </LocalizationProvider>
                        </Stack>

                        <br/>
                        <Stack direction="row">
                            <FormControl fullWidth>
                                <InputLabel id="permit_open_label">Open Permit</InputLabel>
                                <Select
                                labelId="permit_open_label"
                                id="permit_open"
                                value={openpermit}
                                label="Open Permit"
                                onChange={(e) => setOpenPermit(e.target.value)}
                                >
                                <MenuItem value={""}>None</MenuItem>
                                {groups && 
                                    groups.map((item) => (

                                        <MenuItem key={item.user_groups} value={item.user_groups}>{item.user_groups}</MenuItem>
                                    ))
                                }
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel id="permit_todo_label">To-Do List Permit</InputLabel>
                                <Select
                                labelId="permit_todo_label"
                                id="permit_todo"
                                value={todopermit}
                                label="To-Do List Permit"
                                onChange={(e) => setTodoPermit(e.target.value)}
                                >
                                <MenuItem value={""}>None</MenuItem>
                                {groups && 
                                    groups.map((item) => (

                                        <MenuItem key={item.user_groups} value={item.user_groups}>{item.user_groups}</MenuItem>
                                    ))
                                }
                                </Select>
                            </FormControl>
                        </Stack>

                        <br/>
                        <Stack direction="row">
                            <FormControl fullWidth>
                                <InputLabel id="permit_doing_label">Doing Permit</InputLabel>
                                <Select
                                labelId="permit_doing_label"
                                id="permit_doing"
                                value={doingpermit}
                                label="Doing Permit"
                                onChange={(e) => setDoingPermit(e.target.value)}
                                >
                                <MenuItem value={""}>None</MenuItem>
                                {groups && 
                                    groups.map((item) => (

                                        <MenuItem key={item.user_groups} value={item.user_groups}>{item.user_groups}</MenuItem>
                                    ))
                                }
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel id="permit_done_label">Done Permit</InputLabel>
                                <Select
                                labelId="permit_done_label"
                                id="permit_done"
                                value={donepermit}
                                label="Done Permit"
                                onChange={(e) => setDonePermit(e.target.value)}
                                >
                                <MenuItem value={""}>None</MenuItem>
                                {groups && 
                                    groups.map((item) => (

                                        <MenuItem key={item.user_groups} value={item.user_groups}>{item.user_groups}</MenuItem>
                                    ))
                                }
                                </Select>
                            </FormControl>
                        </Stack>
                        <br/>
                        <Stack direction="row">

                            <FormControl fullWidth>
                                <InputLabel id="permit_create_label">Create Permit</InputLabel>
                                <Select
                                labelId="permit_create_label"
                                id="permit_create"
                                value={createpermit}
                                label="Create Permit"
                                onChange={(e) => setCreatePermit(e.target.value)}
                                >
                                <MenuItem value={""}>None</MenuItem>
                                {groups && 
                                    groups.map((item) => (

                                        <MenuItem key={item.user_groups} value={item.user_groups}>{item.user_groups}</MenuItem>
                                    ))
                                }
                                </Select>
                            </FormControl>
                        </Stack>

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

export default AppModal;