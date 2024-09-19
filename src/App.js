import React, {useState, useEffect} from "react";

// import * as React from 'react';

import {
  Box,
  Grid,
  Paper,
  Button,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  LinearProgress,
  CircularProgress
} from '@mui/material'


import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base';
import DownloadIcon from '@mui/icons-material/Download';

import { styled } from '@mui/system';
import UploadButton from './components/UploadButton';
import ColorPicker from './components/ColorPicker';
import TextInputField from './components/TextInputField';

import { wordList, API_HOST } from './const';
import './App.css';

import Axios from 'axios';
import pptxgen from "pptxgenjs";
const _ = require('lodash');

const CircularLoading = () => (
  <>
    <CircularProgress
      size={70}
      sx={{
        position: "fixed",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 2
      }}
      color='secondary'
    />
    <DisabledBackground />
  </>
);

const DisabledBackground = styled(Box)({
  width: "100%",
  height: "100%",
  position: "fixed",
  background: "#ccc",
  opacity: 0.5,
  zIndex: 1
});

function App() {

  const [allTexts, setAllTexts] = useState({})
  const [templateName, setTemplateName] = useState("")
  const [newPresName, setNewPresName] = useState("")
  const [newPresVideoName, setNewPresVideoName] = useState("updated_sample.mp4")

  const [notifyMessage, setNotifyMessage] = useState("")
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);


  

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };







  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('pptFile', file);
    console.log("upload file:", file)
    Axios.post(`${API_HOST}/template/upload`, formData, {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      }    
    })
     .then(response => {
        if(response.status === 200) {
          const responseData = response.data
          console.log("upload response:", responseData)
          setTemplateName(responseData.name)
          setNotifyMessage("File upload successed!")
          setOpen(true)
          // window.confirm(`Uploaded file background color is #${response.data.bgColor}`)
          // setBgColor("#"+response.data.bgColor);
        }
        console.log(response);
      })
      .catch(error => {
        console.error(error);
      });
  };




  const getAllTexts = () => {
    Axios.post(`${API_HOST}/get/texts`, {pptFileName: templateName}, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
     .then(response => {
        if(response.status === 200) {
          const allTextsArrayData = response.data.data

          const allTextsObjData = allTextsArrayData.reduce((acc, item, index) => {
            const textDatakey = item.slideIdx + "_" + item.shapeIdx
            acc[textDatakey] = item; // Use index as key
            return acc;
          }, {});

          setAllTexts(allTexts => ({ ...allTexts, ...allTextsObjData }));

          console.log("all texts:", allTextsObjData)

        }
        console.log(response);
      })
      .catch(error => {
        console.error(error);
      });

  }


  const handleTextChange = ({idx, newValue}) => {
    const newTextvalue = {};
    newTextvalue[idx] = newValue;
    console.log("updated text new data:", newTextvalue)
    setAllTexts(allTexts => ({ ...allTexts, ...newTextvalue }));
  }


  const updatePPTText = () => {
    console.log("all texts:", allTexts)
    const allTextsArray = Object.values(allTexts);
    const textData = {
      template: templateName,
      data: allTextsArray
    }

    Axios.post(`${API_HOST}/update/texts`, textData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
     .then(response => {
        if(response.status === 200) {
          const responseData = response.data
          console.log("update response:", responseData)
          setNewPresName(responseData.name)
          setNotifyMessage("The PPT was updated successfully!")
          setOpen(true)
        }
        console.log(response);
      })
      .catch(error => {
        console.error(error);
      });
  }



  const exportVideo = () => {
    Axios.post(`${API_HOST}/template/export-video`, {pptFileName: newPresName}, {
      headers: {
          'Content-Type': 'application/json'
      }
    })
     .then(response => {
        if(response.status === 200) {
          const responseData = response.data
          console.log("export response:", responseData)
          setNewPresVideoName(responseData.name)
          setNotifyMessage("The video was created successfully!")
          setOpen(true)
        }
        console.log(response);
      })
      .catch(error => {
        console.error(error);
      });

  }


  // http://localhost:8000/template/download/?file_name=test.mp4
  
  const handleDownload = async () => {
    const response = await fetch(`${API_HOST}/template/download?file_name=${newPresVideoName}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/octet-stream',
        }
    });

    if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = newPresVideoName; // Specify the name for the downloaded file
        document.body.appendChild(a);
        a.click();
        a.remove();
    } else {
        console.error('File download failed');
    }
  }






  // const handleDownload = async () => {
  //   const response = await Axios.post(`${API_HOST}/template/download`, {fileName: newPresVideoName}, {
  //     headers: {
  //         'Content-Type': 'application/json'
  //     }
  //   })

  //   if (response.ok) {
  //       const blob = await response.blob();
  //       const url = window.URL.createObjectURL(blob);
  //       const a = document.createElement('a');
  //       a.href = url;
  //       a.download = 'test.mp4'; // Specify the name for the downloaded file
  //       document.body.appendChild(a);
  //       a.click();
  //       a.remove();
  //   } else {
  //       console.error('File download failed');
  //   }


  // }







  return (
    <Box sx={{ width : "100%" }}>
      {loading ? <CircularLoading /> : null}
      <Grid spacing={4} container>
        <Grid xs={12} item sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <UploadButton handleUpload={handleFileUpload} />
        </Grid>

        <Grid xs={12} item sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <Grid xs={6} item>
            <Box sx={{ p: 2, border: '1px solid #000', height: '400px' }}> 
            
              {Object.values(allTexts).map((textObj, index) => (
                <TextInputField key={index} shapeIdx={textObj.shapeIdx} slideIdx={textObj.slideIdx} text={textObj.text} handleTextChange={handleTextChange} />
              ))}

            </Box>


            <Box sx={{marginTop: '10px', float: 'right'}}>
              <Button variant="contained"  color="primary" sx={{marginLeft: '10px'}} onClick={getAllTexts}>
                Extract Text
              </Button>
              <Button variant="contained"  color="success" sx={{marginLeft: '10px'}} onClick={updatePPTText}>
                Update Text
              </Button>
              <Button variant="contained" color="secondary" sx={{marginLeft: '10px'}} onClick={exportVideo}>
                Create Video
              </Button>
              <Button variant="contained" color="error" sx={{marginLeft: '10px'}} onClick={handleDownload}>
                Download
              </Button>

              
            </Box>



          </Grid>
        </Grid>

        <Snackbar
          open={open}
          autoHideDuration={4000}
          onClose={handleClose}
          // message={notifyMessage}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleClose}
            severity="success"
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notifyMessage}
          </Alert>
        </Snackbar>


        {/* <Grid xs={6} item>
          <Grid sx={{marginBottom: 4}} spacing={4} container>
            <Grid xs={6} item>
              <TextField fullWidth label="Row Count" variant='standard' type='number' defaultValue={4} value={rowCount} onChange={handleRowCount} />
            </Grid>
            <Grid xs={6} item>
              <TextField fullWidth label="Col Count" variant='standard' type='number' defaultValue={5} value={colCount} onChange={handleColCount} />
            </Grid>
          </Grid>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  {
                    Array.from({length: colCount}, (_, index) => (<TableCell key={index}>{wordList[index]}</TableCell>))
                  }
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  Array.from({length: rowCount}, (_, index) => (
                    <TableRow
                      key={index}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      {Array.from({length: colCount}, (_, i) => (<TableCell key={`${index}-${i}`}>{rows[index][i]}</TableCell>))}
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid xs={6} item>
          <TextareaAutosize minRows={12} sx={{ width: "100%"}} value={description} onChange={handleDescription}/>
        </Grid>
        
        <Box sx={{width: '100%', marginTop: 4,display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <Box sx={{ marginRight: 4}}>
            <ColorPicker value={bgColor} onChange={handleFontColor} />
          </Box>
          <UploadButton handleUpload={handleFileUpload} />
          <LinearProgress sx={{ width: 200, marginLeft: 4}} variant="determinate" value={uploadProgress} />
        </Box>
        <Box sx={{width: '100%', marginTop: 4,display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <Button variant="contained" endIcon={<DownloadIcon />} onClick={handleDownload}>
            Download
          </Button>
        </Box> */}
      </Grid>
    </Box>
  );
}

export default App;
