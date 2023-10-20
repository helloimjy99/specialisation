/** Definition of Application modal 
 *      Used to both create and edit an application
 */
import { grouplist_style, style, VerifyPMPerms } from '../Utility';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Logout from '../Logout';
import { GetToken, baseurl, config } from '../Utility';

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

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

function PlanModal(props) {

    var customParseFormat = require('dayjs/plugin/customParseFormat');
    dayjs.extend(customParseFormat);
    
    const [planName, setPlanName] = useState("");
    const [startdate, setStartdate] = useState(null);
    const [enddate, setEnddate] = useState(null);
    const [color, setColor] = useState("#ffffff");
    const [modalStatus, setModalStatus] = useState("");

    const clearModal = () => {

        setColor("#ffffff");
        setPlanName("");
        setStartdate(null);
        setEnddate(null);
    }

    const exitModal = () => {

        clearModal();
        setModalStatus("");
        props.refresh(true);
        props.setOpen(false);
        props.setPlanName("");
    }

    async function HandleInputName(event) {

        event.preventDefault();
        setPlanName(event.target.value);

        if (event.target.value !== "") {
            
            event.target.setCustomValidity('');
            return;
        }

        event.target.reportValidity();
        event.target.setCustomValidity('Empty Plan Name not allowed');
        return;
    }

    async function HandleSubmitCreate() {

        let startDate = (startdate) ? dayjs(startdate.$d).format("DD-MM-YYYY") : null;
        let endDate = (enddate) ? dayjs(enddate.$d).format("DD-MM-YYYY") : null;

        let createplan_result;
        try {

            createplan_result = await axios.post(baseurl + '/createplan',
                {
                
                    tmptoken: GetToken(),
                    acronym: props.acronym,
                    start_date: startDate,
                    end_date: endDate,
                    name: planName,
                    color: color
                },
                config
            );
        }
        catch (error) {

            //console.log(error);
            return false;
        }

        if (createplan_result.data.error) {

            return false;
        }
        
        return true
    }

    async function HandleSubmitEdit() {
        
        let startDate = (startdate) ? dayjs(startdate.$d).format("DD-MM-YYYY") : null;
        let endDate = (enddate) ? dayjs(enddate.$d).format("DD-MM-YYYY") : null;
        let editplan_result;
        try {

            editplan_result = await axios.post(baseurl + '/editplan',
                {
                
                    tmptoken: GetToken(),
                    acronym: props.acronym,
                    start_date: startDate,
                    end_date: endDate,
                    name: planName,
                    color: color
                },
                config
            );
        }
        catch (error) {

            //console.log(error);
            return false;
        }

        if (editplan_result.data.error) {

            return false;
        }

        return true
    }

    async function HandleSubmit(event) {

        event.preventDefault();

        if (!event.target.checkValidity()) {
            
            setModalStatus("Invalid Input");
            return;
        }

        let verify = await VerifyPMPerms();

        if (!verify) {

            Logout(null, props.logout);
            return;
        }

        if (!props.planName) {

            let result = await HandleSubmitCreate();

            if (result) {

                alert("Plan created");
                clearModal();
                setModalStatus("Plan created");
                props.refresh(true);
            }
            else {

                alert("Failed to create Plan");
                setModalStatus("Failed to create Plan");
            }
        }
        else {

            let result = await HandleSubmitEdit();

            if (result) {

                alert("Plan Edited");
                props.refresh(true);
                exitModal();
            }
            else {

                alert("Failed to edit Plan");
                setModalStatus("Failed to edit Plan");
            }
        }
    }

    useEffect(() => {

        async function getPlan() {

            let verify = await VerifyPMPerms();

            if (!verify) {

                Logout(null, props.logout);
                return false;
            }

            let token = GetToken();
            let response;

            try {

                response = await axios.post(baseurl + '/getplan',
                    {
                    
                        tmptoken: token,
                        acronym: props.acronym,
                        name: props.planName
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
                let plan = response.data.plan;
                setPlanName(props.planName);
                setStartdate((plan.plan_startdate) ? (dayjs(plan.plan_startdate, "DD-MM-YYYY")) : plan.plan_startdate);
                setEnddate((plan.plan_enddate) ? (dayjs(plan.plan_enddate, "DD-MM-YYYY")) : plan.plan_enddate);
                setColor(plan.plan_color);

                return true;
            }
            
            //response not expected
            return false; 
        }

        if (props.planName) {

            getPlan();
        }
    }, [props.planName])
    
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
                        {(props.planName) ? "Edit " + props.planName : "Create New Plan"}
                    </Typography>
                    <IconButton sx={{float: "right"}} onClick={() => exitModal() }>
                        <CloseIcon/>
                    </IconButton>
                </Stack>
                
                {(modalStatus!=="") && <div style={{ color: 'red' }}>{modalStatus}</div>}
                <Container component="main" maxWidth="xs">
                    <CssBaseline />
                    <Box component="form" onSubmit={HandleSubmit} noValidate>
                        {(!props.planName) &&
                        <>
                            <label>Name</label>
                            <TextField
                                margin="normal"
                                required={(!props.planName)}
                                fullWidth
                                id="planName"
                                value={planName}
                                onChange={(input_name) => HandleInputName(input_name)}
                                autoFocus={(!props.planName)}
                            />
                        </>
                        }
                        <br/>
                        <br/>
                        <Stack direction="row">
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker 
                                    value={startdate}
                                    onChange={(e) => { setStartdate(e)}}
                                    label="Start Date"
                                    inputFormat="DD/MM/YYYY"
                                    //defaultValue={dayjs(new Date().toLocaleDateString())}
                                />
                            </LocalizationProvider>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker 
                                    value={enddate}
                                    onChange={(e) => { setEnddate(e)}}
                                    label="End Date"
                                    inputFormat="DD/MM/YYYY"
                                    //defaultValue={dayjs(new Date().toLocaleDateString())}
                                />
                            </LocalizationProvider>
                        </Stack>

                        <br/>
                        <label>Label Color</label>
                        <br/>
                        <input 
                            type="color"
                            value={color}
                            onChange={(input_color) => setColor(input_color.target.value)}
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

export default PlanModal;