/** Definition of group list modal */

import '../App.css';
import { React, useEffect, useState } from 'react';
import Logout from '../Logout';
import { GetToken, config, baseurl, grouplist_style, VerifyPMPerms, CheckGroup, VerifyCurrent } from '../Utility';
import axios from 'axios';
import PlanModal from '../PlanModal';

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
import EditIcon from '@mui/icons-material/Edit';

function PlanList(props) {

    const [plans, setPlans] = useState([]);
    const [refresh, setRefresh] = useState(true);
    const [openPlanModal, setOpenPlanModal] = useState(false);
    const [currentPlan, setCurrentPlan] = useState("");
    const [PM, setPM] = useState(false);

    function HandleExitModal() {

        props.setOpen(false);
        props.refresh(true);
    }

    async function HandleOpenPlanModal(plan) {

        const verified = await VerifyPMPerms();
    
        if (verified === false) {

            Logout(null, props.logout);
            return;
        }

        setCurrentPlan(plan);
        setOpenPlanModal(true);
    }

    useEffect(() => {

        const getPerms = async () => {
            
            let pmperm = await CheckGroup("ProjectManager");
            setPM(pmperm);
            //console.log("pm set in modal")
        }

        const getPlans = async () => {

            const verified = await VerifyCurrent();
    
            if (verified === false) {
    
                Logout(null, props.logout);
                return;
            }
    
            let token = GetToken();
            
            if (!token) {
            
                Logout(null, props.logout);
                return;
            }
            
            let response;
            
            try {

                response = await axios.post(baseurl + '/getplans',
                    {
                    
                        tmptoken: token,
                        acronym: props.acronym
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
                setPlans(response.data.plans);
                return;
            }
            
            //response not expected
            return; 
        }

        if (refresh) {
            
            getPlans();
            getPerms();
        }

        setRefresh(false);
    }, [refresh, props.acronym, props.logout]);

    return (

        <Modal
            open={props.opened}
            onClose={HandleExitModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            sx={{maxHeight:"80%"}}
        >
            <Box sx={grouplist_style}>
                <Stack direction="row">
                    <Typography variant="h6" component="h6">
                        Plans
                    </Typography>
                    <IconButton onClick={() => HandleExitModal() }>
                        <CloseIcon/>
                    </IconButton>
                </Stack>
                {PM &&
                <>
                    <IconButton onClick={() => HandleOpenPlanModal("") }>
                        <AddIcon/>
                    </IconButton>
                    <PlanModal opened={openPlanModal} setOpen={setOpenPlanModal} refresh={setRefresh} logout={props.logout} planName={currentPlan} setPlanName={setCurrentPlan} acronym={props.acronym}/>
                </>
                }
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 100 }} size="small" aria-label="a dense table">
                        <TableHeadmui>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Start Date</TableCell>
                                <TableCell>End Date</TableCell>
                                {PM &&
                                <TableCell></TableCell>
                                }
                            </TableRow>
                        </TableHeadmui>
                        <TableBody>
                            {plans.length > 0 && plans.map((item) => (
                                <TableRow  key={item.plan_mvp_name} sx={{ borderLeft:"solid " + item.plan_color + " 5px"}}>
                                    <TableCell>{item.plan_mvp_name}</TableCell>
                                    <TableCell>{(item.plan_startdate) ? item.plan_startdate : "-"}</TableCell>
                                    <TableCell>{(item.plan_enddate) ? item.plan_enddate : "-"}</TableCell>
                                    {PM &&
                                    <TableCell>
                                        <IconButton onClick={() => HandleOpenPlanModal(item.plan_mvp_name)}>
                                            <EditIcon/>
                                        </IconButton>
                                    </TableCell>
                                    }
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Modal>
    )
}

export default PlanList;