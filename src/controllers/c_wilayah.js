import axios from "axios";
import { API_WILAYAH } from "../config/secret.js";
import Messages from "../utils/messages.js";

// PROVINCE
const provinces = (req, res) => {
  axios.get(`${API_WILAYAH}/provinces.json`)
  .then((response) => {
    Messages(res, 200, "Success", response.data)
  })
  .catch((error) => {
    Messages(res, error.response.status, error.message)
  })
}

// REGENCY
const regencies = (req, res) => {
  const id = parseInt(req.params.id);

  if (!id) return Messages(res, 404, "ID Provinces not found", [])

  axios.get(`${API_WILAYAH}/regencies/${id}.json`)
  .then((response) => {
    Messages(res, 200, "Success", response.data)
  })
  .catch((error) => {
    Messages(res, error.response.status, error.message)
  })

}

// DISTRICT
const districts = (req, res) => {
  const id = parseInt(req.params.id);

  if (!id) return Messages(res, 404, "ID Regency/City not found", [])

  axios.get(`${API_WILAYAH}/districts/${id}.json`)
  .then((response) => {
    Messages(res, 200, "Success", response.data)
  })
  .catch((error) => {
    Messages(res, error.response.status, error.message)
  })

}

// VILLAGE
const villages = (req, res) => {
  const id = parseInt(req.params.id);

  if (!id) return Messages(res, 404, "ID Districts not found", [])

  axios.get(`${API_WILAYAH}/villages/${id}.json`)
  .then((response) => {
    Messages(res, 200, "Success", response.data)
  })
  .catch((error) => {
    Messages(res, error.response.status, error.message)
  })

}


export { 
  provinces, regencies, districts, villages
}