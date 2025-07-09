import { useState, useEffect} from 'react'
import * as React from 'react';
import './App.css'
import * as chrono from 'chrono-node'
import InputSlider from './components/slider.jsx'
import BasicSelect from './components/dropdown.jsx'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import 'leaflet/dist/leaflet.css';
import CircularProgress from '@mui/material/CircularProgress';

import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default icon paths for bundlers like Vite
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});


function App() {
  const [imagePages, setImagePages] = React.useState({});
  const [imageUrl, setImageUrl] = React.useState(null);
  const [category, setCategory] = React.useState("Parades");
  
  const [goodPage, setGoodPage] = React.useState(true);

  const [picturePositionLat, setPicturePositionLat] = React.useState(0);
  const [picturePositionLong, setPicturePositionLong] = React.useState(0);
  const [pictureYear, setPictureYear] = React.useState();

  const [userPositionLat, setUserPositionLat] = React.useState(0);
  const [userPositionLong, setUserPositionLong] = React.useState(0);
  const [userYear, setUserYear] = React.useState(2000);

  const [userMarker, setUserMarker] = useState(null);

  const [submitted, setSubmitted] = useState(false);
  const [distance, setDistance] = useState(null);

  const [points, setPoints] = useState(0);
  const [roundPoints, setRoundPoints] = useState(0);
  const [round, setRound] = useState(1);

  const [open, setOpen] = useState(true);

  const[gameOver, setGamerOver] = useState(false);


  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };

  useEffect(() => {
    fetch(
      "https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:" + category + "&cmnamespace=6&cmlimit=500&format=json&origin=*",
      requestOptions
      )
      .then(response => {
        return response.json()
      })
      .then(data => {
        setImagePages(data);

        let categoryList = data.query.categorymembers;

        let randomNumber = Math.floor(Math.random() * ((categoryList.length-1) - 1 + 1)) + 1;
        let fileTitle = categoryList[randomNumber].title;

        let valid = false;

        do {
          if (categoryList && fileTitle) {
            valid = true;
          } else {
            randomNumber = Math.floor(Math.random() * ((categoryList.length-1) - 1 + 1)) + 1;
            fileTitle = categoryList[randomNumber].title;
          }
        } while (!valid)

        getImageUrl(fileTitle);
      })
      .catch(error => {
        console.error("Category does not exists!" + error);
      });
  }, [category, goodPage])

  function getImageUrl(fileTitle) {
    fetch(
      'https://commons.wikimedia.org/w/api.php?action=query&titles=' + fileTitle + '&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*',
      requestOptions
      )
      .then(response => {
        return response.json()
      })
      .then(data => {
        console.log(Object.values(data.query.pages)[0].imageinfo[0].url)

        let currentImage = Object.values(data.query.pages)[0];
        let hasGPSLatitue = currentImage.imageinfo[0].extmetadata.GPSLatitude;
        let hasGPSLongitude = currentImage.imageinfo[0].extmetadata.GPSLongitude;
        let hasDateTaken = currentImage.imageinfo[0].extmetadata.DateTimeOriginal;

        if (hasGPSLatitue && hasGPSLongitude && hasDateTaken) {
            console.log("Valid");
            setImageUrl(Object.values(data.query.pages)[0].imageinfo[0].url);

            console.log("GPSLAT: " + hasGPSLatitue.value);
            setPicturePositionLat(hasGPSLatitue.value);

            console.log("GPSLON: " + hasGPSLongitude.value);
            setPicturePositionLong(hasGPSLongitude.value);

            console.log("GPSDATE: " + hasDateTaken.value);
            console.log(normalizeWithChrono(hasDateTaken.value));
            setPictureYear(Number(normalizeWithChrono(hasDateTaken.value).slice(0, 4)));

        } else {
            setGoodPage(!goodPage);
            console.log("Invalid");
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  function normalizeWithChrono(dateStr) {
    const parsed = chrono.parseDate(dateStr)
    if (!parsed) return 'Invalid Date'

    return parsed.toISOString().slice(0, 10)
  }

  function UserClickMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;

        setUserPositionLat(lat);
        setUserPositionLong(lng);

        setUserMarker([lat, lng]);
      }
    });
    return null;
  }

  function calculateDistance(userLat, userLong, pictureLat, pictureLong) {
    const radiusEarth = 6371;
    const distanceLat = deg2rad(pictureLat - userLat);
    const distanceLong = deg2rad(pictureLong - userLong);
    const a =
      Math.sin(distanceLat / 2) * Math.sin(distanceLat / 2) +
      Math.cos(deg2rad(userLat)) * Math.cos(deg2rad(pictureLat)) *
      Math.sin(distanceLong / 2) * Math.sin(distanceLong / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return radiusEarth * c;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  const handleClose = () => {
    setOpen(false);
  };

  function calculateRoundPoints(distanceBetween) {
    const maxPoints = 5000;

    console.log("This is the distiance" + distanceBetween);
    let locationPoints = maxPoints - distanceBetween * (1);

    const difference = Math.abs(userYear - pictureYear);
    let timePoints = maxPoints - difference * (100);

    if (isNaN(timePoints)) {
      timePoints = 5000;
    }

    if (timePoints < 0) {
      timePoints = 0;
    }

    if (locationPoints < 0) {
      locationPoints = 0;
    }

    console.log(locationPoints);
    console.log(timePoints);

    const totalPoints = locationPoints + timePoints;

    setPoints(Math.round(totalPoints) + points);
    return Math.round(totalPoints);
  }

  return (
    <>
      {!gameOver ? (
        <>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={{position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'black',
              border: '2px solid #000',
              boxShadow: 24,
              p: 4,}}>

              <Typography id="modal-modal-title" variant="h6" component="h2">
                How To Play:
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
                {`• Pick a category to get an image (some are harder!)
                • GOAL: Guess the year and location it was taken!
                • The closer you are, the more points you'll get!
                • You have 5 rounds to score big!
                • Have fun!`}
              </Typography>
            </Box>
          </Modal>

          <h1>Round {round}/5</h1>
          <h2>Current Points: {points}</h2>
          <BasicSelect value={category} onChange={setCategory}></BasicSelect>
          
          {imageUrl ? (
            <img src={imageUrl} alt="Fetching an image!" width={'400px'} height={'400px'}/>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <CircularProgress style={{ marginLeft: '10px', color: '#1976d2' }} />
            </div>
          )}

          <InputSlider value={userYear} onChange={setUserYear}></InputSlider>

          <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />

            {submitted && (
              <Marker position={[picturePositionLat, picturePositionLong]}>
                <Popup>
                  Photo Taken Here!
                </Popup>
              </Marker>
            )}
            

            <UserClickMarker />

            {userMarker && (
              <Marker position={userMarker}>
                <Popup>{userPositionLat}, {userPositionLong}</Popup>
              </Marker>
            )}

          </MapContainer>

          {submitted && (
          <p>Distance Between: {distance}km</p>
          )}

          {submitted && (
          <p>Actual Year: {pictureYear}</p>
          )}

          {submitted && (
          <p>Total Points gained this round: {roundPoints}</p>
          )}
          
          {!submitted && (
            <Button
              onClick={() => {
                if (!userMarker) {
                  alert("Please click somewhere on the map!");
                } else {
                  setSubmitted(true);

                  const distanceBetween = calculateDistance(userPositionLat, userPositionLong, picturePositionLat, picturePositionLong);
                  setDistance(Math.round(distanceBetween));
                  
                  setRoundPoints(calculateRoundPoints(Math.round(distanceBetween)));

                  console.log("submit pressed");
                }
              }}
            >
              Submit Guess
            </Button>
          )}

          {submitted && (
            <Button
              onClick={() => {
                if (round < 5) {
                  setSubmitted(false);
                  setRound(round + 1);
                  setGoodPage(!goodPage)
                  setUserMarker(null);
                  setImageUrl(null);
                  setUserYear(2000);
                  console.log("continued pressed");
                } else {
                  setGamerOver(true);
                }
              }}
            >
              Continue?
            </Button>
          )}
        </>
      ) : (
        <>
        <p>game over :0</p>
        <p>Total Points: {points}/50,000</p>
        <Button
          onClick={() => {
            setGamerOver(false);
            setSubmitted(false);
            setRound(1);
            setGoodPage(!goodPage)
            setUserMarker(null);
            setImageUrl(null);
            setUserYear(2000);
            setPoints(0);
            setSubmitted(false);
            setRoundPoints(0);
            setDistance(null);
            setOpen(true);
          }}
        >
          Want to restart?
        </Button>
        </>
      )}
      
    </>
  )
}

export default App
